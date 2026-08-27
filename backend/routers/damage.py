# 임대 자재 (파손, 훼손 이력 관리-망실처리)
from fastapi import APIRouter, Depends, HTTPException
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
def get_damage_list(resolved: bool | None = None, db: Session = Depends(get_db)):
    """resolved 쿼리 파라미터로 처리 여부 필터링 가능 (예: ?resolved=false)"""
    query = db.query(models.DamageHistory)
    if resolved is not None:
        query = query.filter(models.DamageHistory.resolved == resolved)
    return query.order_by(models.DamageHistory.created_at.desc()).all()


@router.get("/{damage_id}", response_model=schemas.DamageResponse)
def get_damage(damage_id: int, db: Session = Depends(get_db)):
    damage = db.query(models.DamageHistory).filter(models.DamageHistory.id == damage_id).first()
    if not damage:
        raise HTTPException(status_code=404, detail="분실/파손 이력을 찾을 수 없습니다.")
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


@router.delete("/{damage_id}")
def delete_damage(damage_id: int, db: Session = Depends(get_db)):
    damage = db.query(models.DamageHistory).filter(models.DamageHistory.id == damage_id).first()
    if not damage:
        raise HTTPException(status_code=404, detail="분실/파손 이력을 찾을 수 없습니다.")

    db.delete(damage)
    db.commit()
    return {"message": "삭제되었습니다."}