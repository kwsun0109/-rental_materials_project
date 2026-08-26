from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional


class TransactionCreate(BaseModel):
    material_id: int
    company_id: int
    type: str          # '반입' or '반출'
    qty: int
    rental_start_date: Optional[date] = None
    rental_due_date: Optional[date] = None
    note: Optional[str] = None


class TransactionResponse(TransactionCreate):
    id: int
    returned_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True  # SQLAlchemy 객체 → Pydantic 변환 허용


class MaterialCreate(BaseModel):
    name: str
    category: Optional[str] = None
    unit: Optional[str] = None
    total_qty: int = 0


class MaterialResponse(MaterialCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
        
class CompanyCreate(BaseModel):
    name: str
    contact: Optional[str] = None
    address: Optional[str] = None


class CompanyResponse(CompanyCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
        
class SettlementCreate(BaseModel):
    company_id: int
    period_start: date
    period_end: date
    amount: float
    status: Optional[str] = "미정산"


class SettlementResponse(SettlementCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class DamageCreate(BaseModel):
    transaction_id: int
    type: str          # '분실' or '파손'
    description: Optional[str] = None
    responsible_party: Optional[str] = None
    resolved: bool = False


class DamageResponse(DamageCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True