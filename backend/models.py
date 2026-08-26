from sqlalchemy import (
    Column, Integer, String, Text, Boolean,
    DECIMAL, Date, TIMESTAMP, ForeignKey, CheckConstraint, func
)
from sqlalchemy.orm import relationship
from database import Base


class Material(Base):
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    category = Column(String(50))
    unit = Column(String(20))
    total_qty = Column(Integer, default=0)
    created_at = Column(TIMESTAMP, server_default=func.now())

    transactions = relationship("Transaction", back_populates="material")


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    contact = Column(String(50))
    address = Column(String(200))
    created_at = Column(TIMESTAMP, server_default=func.now())

    transactions = relationship("Transaction", back_populates="company")
    settlements = relationship("Settlement", back_populates="company")


class Transaction(Base):
    __tablename__ = "transactions"
    __table_args__ = (
        CheckConstraint("type IN ('반입', '반출')", name="chk_type"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    material_id = Column(Integer, ForeignKey("materials.id"))
    company_id = Column(Integer, ForeignKey("companies.id"))
    type = Column(String(10), nullable=False)
    qty = Column(Integer, nullable=False)
    rental_start_date = Column(Date)
    rental_due_date = Column(Date)
    returned_at = Column(TIMESTAMP, nullable=True)
    note = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())

    material = relationship("Material", back_populates="transactions")
    company = relationship("Company", back_populates="transactions")
    damage_records = relationship("DamageHistory", back_populates="transaction")


class Settlement(Base):
    __tablename__ = "settlements"
    __table_args__ = (
        CheckConstraint("status IN ('미정산', '정산완료')", name="chk_status"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    period_start = Column(Date)
    period_end = Column(Date)
    amount = Column(DECIMAL(12, 2))
    status = Column(String(20), default="미정산")
    created_at = Column(TIMESTAMP, server_default=func.now())

    company = relationship("Company", back_populates="settlements")


class DamageHistory(Base):
    __tablename__ = "damage_history"
    __table_args__ = (
        CheckConstraint("type IN ('분실', '파손')", name="chk_damage_type"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"))
    type = Column(String(10))
    description = Column(Text)
    responsible_party = Column(String(100))
    resolved = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    transaction = relationship("Transaction", back_populates="damage_records")