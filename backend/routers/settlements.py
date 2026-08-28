# 임대자재 정산 내역 관리...(정산(청구, 입금), 미수금 관리)
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
import models, schemas

router = APIRouter(prefix="/settlements", tags=["settlements"])


@router.post("/", response_model=schemas.SettlementResponse)
def create_settlement(payload: schemas.SettlementCreate, db: Session = Depends(get_db)):
    if payload.status not in ("미정산", "정산완료"):
        raise HTTPException(status_code=400, detail="status는 '미정산' 또는 '정산완료'이어야 합니다.")

    company = db.query(models.Company).filter(models.Company.id == payload.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="거래처를 찾을 수 없습니다.")

    settlement = models.Settlement(**payload.model_dump())
    db.add(settlement)
    db.commit()
    db.refresh(settlement)
    return settlement


@router.get("/", response_model=list[schemas.SettlementResponse])
def get_settlements(db: Session = Depends(get_db)):
    result = db.execute(text("""
        SELECT s.*, c.name as company_name 
        FROM settlements s
        LEFT JOIN companies c ON s.company_id = c.id
        ORDER BY s.id DESC
    """))
    return result.mappings().all()


@router.get("/{settlement_id}", response_model=schemas.SettlementResponse)
def get_settlement(settlement_id: int, db: Session = Depends(get_db)):
    settlement = db.query(models.Settlement).filter(models.Settlement.id == settlement_id).first()
    if not settlement:
        raise HTTPException(status_code=404, detail="정산 내역을 찾을 수 없습니다.")
    return settlement


@router.get("/company/{company_id}", response_model=list[schemas.SettlementResponse])
def get_settlements_by_company(company_id: int, db: Session = Depends(get_db)):
    """특정 거래처의 정산 내역 전체"""
    company = db.query(models.Company).filter(models.Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="거래처를 찾을 수 없습니다.")

    return db.query(models.Settlement).filter(
        models.Settlement.company_id == company_id
    ).order_by(models.Settlement.period_start.desc()).all()


@router.patch("/{settlement_id}/complete")
def mark_settlement_complete(settlement_id: int, db: Session = Depends(get_db)):
    settlement = db.query(models.Settlement).filter(models.Settlement.id == settlement_id).first()
    if not settlement:
        raise HTTPException(status_code=404, detail="정산 내역을 찾을 수 없습니다.")
    if settlement.status == "정산완료":
        raise HTTPException(status_code=400, detail="이미 정산 완료된 건입니다.")

    settlement.status = "정산완료"
    db.commit()
    return {"message": "정산 완료 처리되었습니다."}

@router.patch("/{settlement_id}/uncomplete")
def unmark_settlement_complete(settlement_id: int, db: Session = Depends(get_db)):
    settlement = db.query(models.Settlement).filter(models.Settlement.id == settlement_id).first()
    if not settlement:
        raise HTTPException(status_code=404, detail="정산 내역을 찾을 수 없습니다.")
    
    # 상태를 '미정산' 또는 원래 상태로 되돌림 (프로젝트 내 상태 값에 맞게 수정)
    settlement.status = "미정산" 
    db.commit()
    return {"message": "정산 취소 완료"}


@router.get("/company/{company_id}/calculate-period")
def calculate_period_amount(
    company_id: int,
    period_start: str,
    period_end: str,
    db: Session = Depends(get_db)
):
    """
    기간 내 해당 거래처의 반출 건수를 기반으로 정산 금액을 미리 계산해보는 용도.
    실제 단가 정책은 프로젝트 요구사항에 맞게 조정 필요 (여기서는 예시로 qty 합계만 반환).
    """
    result = db.execute(
        text("""
            SELECT
                SUM(qty) AS total_qty,
                COUNT(*) AS transaction_count
            FROM transactions
            WHERE company_id = :company_id
              AND type = '반출'
              AND created_at BETWEEN :period_start AND :period_end
        """),
        {"company_id": company_id, "period_start": period_start, "period_end": period_end}
    ).mappings().first()

    return result

@router.delete("/{settlement_id}")
def delete_settlement(settlement_id: int, db: Session = Depends(get_db)):
    settlement = db.query(models.Settlement).filter(models.Settlement.id == settlement_id).first()
    if not settlement:
        raise HTTPException(status_code=404, detail="정산 내역을 찾을 수 없습니다.")

    db.delete(settlement)
    db.commit()
    return {"message": "삭제되었습니다."}