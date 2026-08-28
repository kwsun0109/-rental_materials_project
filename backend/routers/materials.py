# 임대 자재 목록
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas

router = APIRouter(prefix="/materials", tags=["materials"])


@router.post("/", response_model=schemas.MaterialResponse)
def create_material(payload: schemas.MaterialCreate, db: Session = Depends(get_db)):
    material = models.Material(**payload.model_dump())
    db.add(material)
    db.commit()
    db.refresh(material)
    return material


@router.get("/", response_model=list[schemas.MaterialResponse])
def get_materials(db: Session = Depends(get_db)):
    return db.query(models.Material).order_by(models.Material.id).all()


# ⚠️ 주의: /inventory는 반드시 /{material_id} 라우트보다 위에 있어야 합니다.
# FastAPI는 라우트를 위에서부터 순서대로 매칭하기 때문에,
# 만약 /{material_id}가 먼저 오면 "/materials/inventory" 요청이
# material_id="inventory"로 잘못 매칭되어 422 에러가 발생합니다.
@router.get("/inventory")
def get_all_materials_inventory(db: Session = Depends(get_db)):
    """전체 자재의 실시간 재고(가용 수량) 조회 - 한 번의 쿼리로 처리"""
    from sqlalchemy import text
    result = db.execute(
        text("""
            SELECT
                m.id,
                m.name,
                m.category,
                m.unit,
                m.total_qty,
                m.total_qty - COALESCE(SUM(
                    CASE WHEN t.type = '반출' AND t.returned_at IS NULL THEN t.qty ELSE 0 END
                ), 0) AS available_qty
            FROM materials m
            LEFT JOIN transactions t ON m.id = t.material_id
            GROUP BY m.id, m.name, m.category, m.unit, m.total_qty
            ORDER BY m.id
        """)
    ).mappings().all()
    return result


@router.get("/{material_id}", response_model=schemas.MaterialResponse)
def get_material(material_id: int, db: Session = Depends(get_db)):
    material = db.query(models.Material).filter(models.Material.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="자재를 찾을 수 없습니다.")
    return material


@router.put("/{material_id}", response_model=schemas.MaterialResponse)
def update_material(material_id: int, payload: schemas.MaterialCreate, db: Session = Depends(get_db)):
    material = db.query(models.Material).filter(models.Material.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="자재를 찾을 수 없습니다.")

    for key, value in payload.model_dump().items():
        setattr(material, key, value)

    db.commit()
    db.refresh(material)
    return material


@router.delete("/{material_id}")
def delete_material(material_id: int, db: Session = Depends(get_db)):
    material = db.query(models.Material).filter(models.Material.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="자재를 찾을 수 없습니다.")

    # 거래 이력이 있는 자재는 삭제 막기 (FK 제약으로도 막히지만, 명확한 에러 메시지를 위해)
    has_transactions = db.query(models.Transaction).filter(
        models.Transaction.material_id == material_id
    ).first()
    if has_transactions:
        raise HTTPException(status_code=400, detail="거래 이력이 있는 자재는 삭제할 수 없습니다.")

    db.delete(material)
    db.commit()
    return {"message": "삭제되었습니다."}


@router.get("/{material_id}/inventory")
def get_material_inventory(material_id: int, db: Session = Depends(get_db)):
    """개별 자재의 실시간 재고(가용 수량) 조회 — inventory_status 뷰와 동일 로직"""
    from sqlalchemy import text
    result = db.execute(
        text("""
            SELECT
                m.id,
                m.name,
                m.total_qty,
                m.total_qty - COALESCE(SUM(
                    CASE WHEN t.type = '반출' AND t.returned_at IS NULL THEN t.qty ELSE 0 END
                ), 0) AS available_qty
            FROM materials m
            LEFT JOIN transactions t ON m.id = t.material_id
            WHERE m.id = :material_id
            GROUP BY m.id, m.name, m.total_qty
        """),
        {"material_id": material_id}
    ).mappings().first()

    if not result:
        raise HTTPException(status_code=404, detail="자재를 찾을 수 없습니다.")
    return result