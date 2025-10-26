from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class GenerateRequest(BaseModel):
    """Request model for generating LLM responses"""
    prompt: str = Field(..., min_length=1, max_length=5000)
    model: str = Field(default="gpt-3.5-turbo")
    temperature_range: List[float] = Field(default=[0.3, 0.7, 1.0])
    top_p_range: List[float] = Field(default=[0.9, 0.95, 1.0])
    
    class Config:
        json_schema_extra = {
            "example": {
                "prompt": "Explain the benefits of exercise",
                "model": "gpt-3.5-turbo",
                "temperature_range": [0.3, 0.7, 1.0],
                "top_p_range": [0.9, 1.0]
            }
        }


class ResponseMetrics(BaseModel):
    """Model for response quality metrics"""
    coherence_score: float
    lexical_diversity: float
    completeness_score: float
    structure_score: float
    readability_score: float
    length_appropriateness: float
    overall_score: Optional[float] = None


class ResponseData(BaseModel):
    """Model for individual LLM response"""
    id: int
    temperature: float
    top_p: float
    model: str
    content: str
    metrics: Optional[ResponseMetrics] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class ExperimentResponse(BaseModel):
    """Response model for experiment data"""
    id: int
    prompt: str
    created_at: datetime
    responses: List[ResponseData]
    
    class Config:
        from_attributes = True


class ExperimentListItem(BaseModel):
    """Simplified model for experiment list"""
    id: int
    prompt: str
    created_at: datetime
    response_count: int
    
    class Config:
        from_attributes = True


class ExportRequest(BaseModel):
    """Request model for exporting experiment data"""
    experiment_ids: List[int]
    format: str = Field(default="json", pattern="^(json|csv)$")

