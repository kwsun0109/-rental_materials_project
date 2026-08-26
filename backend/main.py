from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import materials, companies, transactions, settlements, damage

from services.notification import start_scheduler

# 개발 초기엔 편의상 자동 테아블 생성 (운영에서는 Alembic 마이그레이션 권장)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="자재 반입/반출 관리 시스템")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],   # React 개발 서버
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(materials.router)
app.include_router(companies.router)
app.include_router(transactions.router)
app.include_router(settlements.router)
app.include_router(damage.router)

@app.get("/")
def root():
    return {"message": "API 정상 작동 중"}

@app.on_event("startup")
def on_startup():
    start_scheduler()
