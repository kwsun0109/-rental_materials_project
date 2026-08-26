from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas

router = APIRouter(prefix="/companies", tags=["companies"])


@router.post("/", response_model=schemas.CompanyResponse)
def create_company(payload: schemas.CompanyCreate, db: Session = Depends(get_db)):
    company = models.Company(**payload.model_dump())
    db.add(company)
    db.commit()
    db.refresh(company)
    return company


@router.get("/", response_model=list[schemas.CompanyResponse])
def get_companies(db: Session = Depends(get_db)):
    return db.query(models.Company).order_by(models.Company.id).all()


@router.get("/{company_id}", response_model=schemas.CompanyResponse)
def get_company(company_id: int, db: Session = Depends(get_db)):
    company = db.query(models.Company).filter(models.Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="거래처를 찾을 수 없습니다.")
    return company


@router.put("/{company_id}", response_model=schemas.CompanyResponse)
def update_company(company_id: int, payload: schemas.CompanyCreate, db: Session = Depends(get_db)):
    company = db.query(models.Company).filter(models.Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="거래처를 찾을 수 없습니다.")

    for key, value in payload.model_dump().items():
        setattr(company, key, value)

    db.commit()
    db.refresh(company)
    return company


@router.delete("/{company_id}")
def delete_company(company_id: int, db: Session = Depends(get_db)):
    company = db.query(models.Company).filter(models.Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="거래처를 찾을 수 없습니다.")

    has_transactions = db.query(models.Transaction).filter(
        models.Transaction.company_id == company_id
    ).first()
    if has_transactions:
        raise HTTPException(status_code=400, detail="거래 이력이 있는 거래처는 삭제할 수 없습니다.")

    db.delete(company)
    db.commit()
    return {"message": "삭제되었습니다."}


@router.get("/{company_id}/transactions", response_model=list[schemas.TransactionResponse])
def get_company_transactions(company_id: int, db: Session = Depends(get_db)):
    """특정 거래처의 전체 반입/반출 이력"""
    company = db.query(models.Company).filter(models.Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="거래처를 찾을 수 없습니다.")

    return db.query(models.Transaction).filter(
        models.Transaction.company_id == company_id
    ).order_by(models.Transaction.created_at.desc()).all()