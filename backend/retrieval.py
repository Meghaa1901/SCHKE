import json
import re
from datetime import datetime
from pathlib import Path
from sqlmodel import Session, select
from models import Patient, HospitalRecord, AccessLog, RetrievalResult

# Load the ontology once, when this file is first imported
ONTOLOGY = json.loads((Path(__file__).parent / "ontology.json").read_text(encoding="utf-8"))


class RDFGraph:
    """A tiny knowledge graph: a list of (subject, predicate, object) facts."""

    def __init__(self):
        self.triples = []

    def add(self, s, p, o):
        if (s, p, o) not in self.triples:
            self.triples.append((s, p, o))

    def match(self, s=None, p=None, o=None):
        return [
            t for t in self.triples
            if (s is None or t[0] == s)
            and (p is None or t[1] == p)
            and (o is None or t[2] == o)
        ]


def _node(term):
    """'High Blood Pressure' -> 'high_blood_pressure' (a graph-friendly id)."""
    return re.sub(r"\s+", "_", term.strip().lower())


def retrieve(session: Session, hospital_id: str, patient_id: str) -> RetrievalResult:
    trace = []
    graph = RDFGraph()
    trace.append(f"[System] Initializing RDF knowledge graph for {patient_id}")

    # 1. Load the ontology as "X is the same as Y" facts (+ a readable label for each canonical term)
    for syn, canon in ONTOLOGY["conditions"].items():
        graph.add(f"snomed:{_node(syn)}", "owl:sameAs", f"snomed:{_node(canon)}")
        graph.add(f"snomed:{_node(canon)}", "rdfs:label", canon)
    for syn, canon in ONTOLOGY["allergies"].items():
        graph.add(f"rxnorm:{_node(syn)}", "owl:sameAs", f"rxnorm:{_node(canon)}")
        graph.add(f"rxnorm:{_node(canon)}", "rdfs:label", canon)
    trace.append("[Ontology] Loaded semantic mapping triples (owl:sameAs).")

    patient_node = f"patient:{patient_id}"

    # 2. Pull this patient's scattered records from every hospital
    records = session.exec(
        select(HospitalRecord).where(HospitalRecord.patient_id == patient_id)
    ).all()

    # Fold in anything already on the patient's central profile
    patient = session.get(Patient, patient_id)
    if patient:
        for c in patient.conditions:
            graph.add(patient_node, "scke:hasCondition", f"snomed:{_node(c)}")

    # 3. Assert each raw record as a fact in the graph
    for r in records:
        prefix = "snomed:" if r.type == "condition" else "rxnorm:"
        predicate = "scke:hasCondition" if r.type == "condition" else "scke:hasAllergy"
        graph.add(patient_node, predicate, f"{prefix}{_node(r.term)}")
        trace.append(f"[Data] Asserted {predicate} -> {prefix}{_node(r.term)} (source: {r.hospital_id})")

    # 4. Inference: follow owl:sameAs to resolve each raw term to its canonical name
    trace.append("[Reasoner] Executing semantic inference...")
    conditions, allergies = set(), set()
    medications = set(patient.medications) if patient else set()

    def resolve(predicate, prefix, bucket):
        for t in graph.match(patient_node, predicate):
            term_node = t[2]
            mappings = graph.match(term_node, "owl:sameAs")
            if mappings:
                canonical = mappings[0][2]
                labels = graph.match(canonical, "rdfs:label")
                if labels:
                    bucket.add(labels[0][2])
                    trace.append(f'[Inference] {term_node} -> {canonical} ("{labels[0][2]}")')
                    continue
            # term not in the ontology -> keep the cleaned-up raw term
            bucket.add(term_node.replace(prefix, "").replace("_", " "))

    resolve("scke:hasCondition", "snomed:", conditions)
    resolve("scke:hasAllergy", "rxnorm:", allergies)

    confidence = min(0.95, 0.6 + len(conditions) * 0.05 + len(allergies) * 0.1)

    # 5. Record the access in the audit log
    session.add(AccessLog(
        timestamp=datetime.now().isoformat(),
        hospital_id=hospital_id,
        action="DATA_RETRIEVAL_EMERGENCY",
        patient_id=patient_id,
        details=f"Semantic retrieval across {len({r.hospital_id for r in records})} source hospitals",
    ))
    session.commit()

    return RetrievalResult(
        patient_id=patient_id,
        conditions=sorted(conditions),
        allergies_confirmed=sorted(allergies),
        medications=sorted(medications),
        confidence_score=round(confidence, 2),
        trace=trace,
    )