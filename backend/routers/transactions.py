from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
import models, schemas

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.post("/", response_model=schemas.TransactionResponse)
def create_transaction(payload: schemas.TransactionCreate, db: Session = Depends(get_db)):
    if payload.type not in ("반입", "반출"):
        raise HTTPException(status_code=400, detail="type은 '반입' 또는 '반출'이어야 합니다.")

    tx = models.Transaction(**payload.model_dump())
    db.add(tx)

    # 반입이면 total_qty 증가
    material = db.query(models.Material).filter(models.Material.id == payload.material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="자재를 찾을 수 없습니다.")

    if payload.type == "반입":
        material.total_qty += payload.qty

    db.commit()
    db.refresh(tx)
    return tx


@router.get("/due-soon", response_model=list[schemas.TransactionResponse])
def get_due_soon(db: Session = Depends(get_db)):
    result = db.execute(text("""
        SELECT * FROM transactions
        WHERE type = '반출'
          AND returned_at IS NULL
          AND rental_due_date <= DATE_ADD(CURDATE(), INTERVAL 3 DAY)
    """))
    return result.mappings().all()


@router.patch("/{transaction_id}/return")
def mark_returned(transaction_id: int, db: Session = Depends(get_db)):
    tx = db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="거래 기록을 찾을 수 없습니다.")
    if tx.returned_at is not None:
        raise HTTPException(status_code=400, detail="이미 반납 처리된 건입니다.")

    from datetime import datetime
    tx.returned_at = datetime.now()
    db.commit()
    return {"message": "반납 처리 완료"}