from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Experiment(Base):
    """Model for storing LLM experiments"""
    __tablename__ = "experiments"

    id = Column(Integer, primary_key=True, index=True)
    prompt = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    responses = relationship("Response", back_populates="experiment", cascade="all, delete-orphan")


class Response(Base):
    """Model for storing individual LLM responses"""
    __tablename__ = "responses"

    id = Column(Integer, primary_key=True, index=True)
    experiment_id = Column(Integer, ForeignKey("experiments.id"), nullable=False)
    
    # LLM parameters
    temperature = Column(Float, nullable=False)
    top_p = Column(Float, nullable=False)
    model = Column(String, default="gpt-3.5-turbo")
    
    # Response data
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Quality metrics (stored as JSON for flexibility)
    metrics = Column(JSON, nullable=True)
    
    # Relationships
    experiment = relationship("Experiment", back_populates="responses")

