from database import create_db_and_tables
import models  # importing this registers your tables (like Hospital)

create_db_and_tables()
print("Database and tables created!")