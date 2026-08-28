# 임대자재 대여/ 반납 목록관리
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
import models, schemas

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("/", response_model=list[schemas.TransactionResponse])
def get_transactions(db: Session = Depends(get_db)):
    return db.query(models.Transaction).order_by(models.Transaction.id.desc()).all()


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
        SELECT t.*, 
               m.name as material_name, 
               c.name as company_name 
        FROM transactions t
        LEFT JOIN materials m ON t.material_id = m.id
        LEFT JOIN companies c ON t.company_id = c.id
        WHERE t.type = '반출'
          AND (
              (t.returned_at IS NULL AND t.rental_due_date <= DATE_ADD(CURDATE(), INTERVAL 3 DAY))
              OR t.returned_at IS NOT NULL
          )
        ORDER BY t.rental_due_date ASC
    """))
    return result.mappings().all()


@router.get("/{transaction_id}", response_model=schemas.TransactionResponse)
def get_transaction(transaction_id: int, db: Session = Depends(get_db)):
    tx = db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="거래 기록을 찾을 수 없습니다.")
    return tx


@router.put("/{transaction_id}", response_model=schemas.TransactionResponse)
def update_transaction(transaction_id: int, payload: schemas.TransactionUpdate, db: Session = Depends(get_db)):
    tx = db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="거래 기록을 찾을 수 없습니다.")

    if payload.type is not None and payload.type not in ("반입", "반출"):
        raise HTTPException(status_code=400, detail="type은 '반입' 또는 '반출'이어야 합니다.")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(tx, key, value)

    db.commit()
    db.refresh(tx)
    return tx


@router.delete("/{transaction_id}")
def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    tx = db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="거래 기록을 찾을 수 없습니다.")

    # 반입 건 삭제 시, 등록 때 증가시켰던 total_qty를 되돌림
    if tx.type == "반입":
        material = db.query(models.Material).filter(models.Material.id == tx.material_id).first()
        if material:
            material.total_qty -= tx.qty

    db.delete(tx)
    db.commit()
    return {"message": "삭제되었습니다."}


@router.patch("/{transaction_id}/return")
def mark_returned(transaction_id: int, db: Session = Depends(get_db)):
    tx = db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="거래 기록을 찾을 수 없습니다.")
    if tx.returned_at is not None:
        raise HTTPException(status_code=400, detail="이미 반납 처리된 건입니다.")

    from datetime import datetime
    tx.returned_at = datetime.now()

    # 반납 완료 시 자재 수량 복구 (예시: total_qty 또는 가용 수량 관련 처리)
    # 프로젝트의 재고 관리 방식에 맞춰 아래 코드를 확인해보세요.
    material = db.query(models.Material).filter(models.Material.id == tx.material_id).first()
    if material and tx.type == "반출":
        # 반출된 건이 반납되었으므로 보유/가용 수량에 반영 (프로젝트 구조에 맞게 수정)
        pass 

    db.commit()
    return {"message": "반납 처리 완료"}


@router.patch("/{transaction_id}/unreturn")
def unmark_returned(transaction_id: int, db: Session = Depends(get_db)):
    tx = db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="거래 기록을 찾을 수 없습니다.")
    if tx.returned_at is None:
        raise HTTPException(status_code=400, detail="아직 반납 처리되지 않은 건입니다.")

    tx.returned_at = None
    db.commit()
    return {"message": "반납 취소 완료"}