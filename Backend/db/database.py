from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config import DB_CONNECTION_STRING

engine = create_engine(DB_CONNECTION_STRING)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
