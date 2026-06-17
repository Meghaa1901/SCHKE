from sqlmodel import create_engine, SQLModel

DATABASE_URL = "sqlite:///scke.db"

# echo=True prints the database commands so you can watch what happens
engine = create_engine(DATABASE_URL, echo=True)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)