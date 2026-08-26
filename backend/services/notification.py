from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy import text
from database import SessionLocal

def check_due_returns():
    db = SessionLocal()
    try:
        result = db.execute(text("""
            SELECT * FROM transactions
            WHERE type = '반출'
              AND returned_at IS NULL
              AND rental_due_date <= DATE_ADD(CURDATE(), INTERVAL 3 DAY)
        """))
        due_list = result.mappings().all()
        for row in due_list:
            print(f"[알림] 반납 임박: transaction_id={row['id']}, 마감일={row['rental_due_date']}")
            # 여기서 이메일/슬랙 등 실제 알림 로직 연결
    finally:
        db.close()

def start_scheduler():
    scheduler = BackgroundScheduler(timezone="Asia/Seoul")
    scheduler.add_job(check_due_returns, "cron", hour=9, minute=0)  # 매일 오전 9시
    scheduler.start()
    return scheduler