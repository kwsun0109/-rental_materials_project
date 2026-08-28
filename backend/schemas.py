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
    company_name: Optional[str] = None

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
    material_name: Optional[str] = None,
    company_name: Optional[str] = None

    class Config:
        from_attributes = True

class TransactionUpdate(BaseModel):
    material_id: Optional[int] = None
    company_id: Optional[int] = None
    type: Optional[str] = None
    qty: Optional[int] = None
    rental_start_date: Optional[date] = None
    rental_due_date: Optional[date] = None
    note: Optional[str] = None

# 기존 Transaction 응답 스키마 예시
class TransactionResponse(BaseModel):
    id: int
    material_id: int
    company_id: int
    type: str
    qty: int
    rental_due_date: Optional[date] = None
    returned_at: Optional[datetime] = None
    
    # 👇 이 필드들을 추가해 주어야 백엔드가 이름을 같이 보낼 수 있습니다!
    material_name: Optional[str] = None
    company_name: Optional[str] = None

    class Config:
        from_attributes = True