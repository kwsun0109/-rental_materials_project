# 임대 자재 (파손, 훼손 이력 관리-망실처리)
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session
from database import get_db
import models, schemas

router = APIRouter(prefix="/damage-history", tags=["damage"])


@router.post("/", response_model=schemas.DamageResponse)
def create_damage(payload: schemas.DamageCreate, db: Session = Depends(get_db)):
    if payload.type not in ("분실", "파손"):
        raise HTTPException(status_code=400, detail="type은 '분실' 또는 '파손'이어야 합니다.")

    transaction = db.query(models.Transaction).filter(
        models.Transaction.id == payload.transaction_id
    ).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="해당 거래 기록을 찾을 수 없습니다.")

    damage = models.DamageHistory(**payload.model_dump())
    db.add(damage)
    db.commit()
    db.refresh(damage)
    return damage


@router.get("/", response_model=list[schemas.DamageResponse])
def get_damage_list(resolved: Optional[bool] = None, db: Session = Depends(get_db)):
    query = """
        SELECT d.*, 
               t.qty as transaction_qty,
               m.name as material_name, 
               c.name as company_name 
        FROM damage_history d
        LEFT JOIN transactions t ON d.transaction_id = t.id
        LEFT JOIN materials m ON t.material_id = m.id
        LEFT JOIN companies c ON t.company_id = c.id
    """
    if resolved is not None:
        query += " WHERE d.resolved = :resolved"
    
    query += " ORDER BY d.id DESC"
    
    result = db.execute(text(query), {"resolved": resolved} if resolved is not None else {})
    return result.mappings().all()


@router.get("/{damage_id}", response_model=schemas.DamageResponse)
def get_damage(damage_id: int, db: Session = Depends(get_db)):
    damage = db.query(models.DamageHistory).filter(models.DamageHistory.id == damage_id).first()
    if not damage:
        raise HTTPException(status_code=404, detail="분실/파손 이력을 찾을 수 없습니다.")
    return damage


@router.put("/{damage_id}", response_model=schemas.DamageResponse)
def update_damage(damage_id: int, payload: schemas.DamageCreate, db: Session = Depends(get_db)):
    """분실/파손 이력 수정"""
    damage = db.query(models.DamageHistory).filter(models.DamageHistory.id == damage_id).first()
    if not damage:
        raise HTTPException(status_code=404, detail="분실/파손 이력을 찾을 수 없습니다.")

    if payload.type not in ("분실", "파손"):
        raise HTTPException(status_code=400, detail="type은 '분실' 또는 '파손'이어야 합니다.")

    # 거래 기록 존재 여부 확인
    transaction = db.query(models.Transaction).filter(
        models.Transaction.id == payload.transaction_id
    ).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="해당 거래 기록을 찾을 수 없습니다.")

    for key, value in payload.model_dump().items():
        setattr(damage, key, value)

    db.commit()
    db.refresh(damage)
    return damage


@router.patch("/{damage_id}/resolve")
def resolve_damage(damage_id: int, db: Session = Depends(get_db)):
    damage = db.query(models.DamageHistory).filter(models.DamageHistory.id == damage_id).first()
    if not damage:
        raise HTTPException(status_code=404, detail="분실/파손 이력을 찾을 수 없습니다.")
    if damage.resolved:
        raise HTTPException(status_code=400, detail="이미 처리 완료된 건입니다.")

    damage.resolved = True
    db.commit()
    return {"message": "처리 완료로 변경되었습니다."}


@router.patch("/{damage_id}/unresolve")
def unresolve_damage(damage_id: int, db: Session = Depends(get_db)):
    damage = db.query(models.DamageHistory).filter(models.DamageHistory.id == damage_id).first()
    if not damage:
        raise HTTPException(status_code=404, detail="분실/파손 이력을 찾을 수 없습니다.")
    
    damage.resolved = False
    db.commit()
    return {"message": "처리가 취소되었습니다."}


@router.delete("/{damage_id}")
def delete_damage(damage_id: int, db: Session = Depends(get_db)):
    damage = db.query(models.DamageHistory).filter(models.DamageHistory.id == damage_id).first()
    if not damage:
        raise HTTPException(status_code=404, detail="분실/파손 이력을 찾을 수 없습니다.")

    db.delete(damage)
    db.commit()
    return {"message": "삭제되었습니다."}