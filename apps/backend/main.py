from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime, timezone
import httpx

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./data/sql_app.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database model
class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, index=True)
    amount = Column(Float)
    type = Column(String) # e.g., 'income', 'expense'
    date = Column(DateTime, default=lambda: datetime.now(timezone.utc))

# Create database tables
Base.metadata.create_all(bind=engine)

# Pydantic models for request/response
class TransactionCreate(BaseModel):
    description: str
    amount: float
    type: str

class TransactionResponse(TransactionCreate):
    id: int
    date: datetime

    class Config:
        from_attributes = True

class NumbersToSum(BaseModel):
    values: list[float]

class SumResult(BaseModel):
    sum: float

app = FastAPI()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
async def read_root():
    return {"message": "Welcome to your Personal Financial AI Assistant!"}

@app.post("/transactions/", response_model=TransactionResponse)
async def create_transaction(transaction: TransactionCreate, db: Session = Depends(get_db)):
    db_transaction = Transaction(**transaction.model_dump())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@app.get("/transactions/", response_model=list[TransactionResponse])
async def read_transactions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    transactions = db.query(Transaction).offset(skip).limit(limit).all()
    return transactions

@app.post("/calculate-sum/", response_model=SumResult)
async def calculate_sum_with_rust(numbers: NumbersToSum):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post("http://localhost:8001/sum", json=numbers.model_dump())
            response.raise_for_status() # Raise an exception for 4xx/5xx responses
            return response.json()
        except httpx.RequestError as exc:
            raise HTTPException(status_code=500, detail=f"An error occurred while requesting Rust engine: {exc}")
        except httpx.HTTPStatusError as exc:
            raise HTTPException(status_code=exc.response.status_code, detail=f"Rust engine returned an error: {exc.response.text}")
