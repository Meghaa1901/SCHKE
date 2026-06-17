from sqlmodel import create_engine, SQLModel, Session

DATABASE_URL = "sqlite:///scke.db"

# echo=True prints the database commands so you can watch what happens
engine = create_engine(DATABASE_URL, echo=True)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session