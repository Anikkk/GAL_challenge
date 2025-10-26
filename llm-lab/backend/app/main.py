"""
Main FastAPI application for LLM Lab
"""

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
import json
import csv
import io

from app.database import get_db, init_db
from app.models import Experiment, Response
from app.schemas import (
    GenerateRequest,
    ExperimentResponse,
    ResponseData,
    ResponseMetrics as ResponseMetricsSchema,
    ExperimentListItem,
    ExportRequest
)
from app.llm_service import LLMService
from app.metrics import ResponseMetrics

# Initialize FastAPI app
app = FastAPI(
    title="LLM Lab API",
    description="API for experimenting with LLM parameters and analyzing response quality",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize LLM service
llm_service = LLMService()


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    await init_db()


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "LLM Lab API",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "openai_configured": llm_service.openai_client is not None,
        "anthropic_configured": llm_service.anthropic_client is not None,
    }


@app.post("/api/generate", response_model=ExperimentResponse)
async def generate_responses(
    request: GenerateRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Generate multiple LLM responses with different parameter combinations.
    Calculates quality metrics for each response.
    """
    try:
        # Create new experiment
        experiment = Experiment(prompt=request.prompt)
        db.add(experiment)
        await db.flush()
        
        # Generate responses with different parameter combinations
        responses_data = await llm_service.generate_multiple_responses(
            prompt=request.prompt,
            model=request.model,
            temperature_range=request.temperature_range,
            top_p_range=request.top_p_range
        )
        
        # Process each response and calculate metrics
        response_objects = []
        for temp, top_p, content in responses_data:
            # Calculate quality metrics
            metrics = ResponseMetrics.calculate_all_metrics(content)
            metrics['overall_score'] = ResponseMetrics.calculate_overall_score(metrics)
            
            # Create response object
            response_obj = Response(
                experiment_id=experiment.id,
                temperature=temp,
                top_p=top_p,
                model=request.model,
                content=content,
                metrics=metrics
            )
            db.add(response_obj)
            response_objects.append(response_obj)

        print(f"Generated {len(response_objects)} responses for experiment ID {experiment.id}")
        
        # Commit to database
        await db.commit()
        
        # Refresh objects to get IDs
        await db.refresh(experiment)
        for resp in response_objects:
            await db.refresh(resp)
        
        # Convert to response schema
        return ExperimentResponse(
            id=experiment.id,
            prompt=experiment.prompt,
            created_at=experiment.created_at,
            responses=[
                ResponseData(
                    id=resp.id,
                    temperature=resp.temperature,
                    top_p=resp.top_p,
                    model=resp.model,
                    content=resp.content,
                    metrics=ResponseMetricsSchema(**resp.metrics) if resp.metrics else None,
                    created_at=resp.created_at
                )
                for resp in response_objects
            ]
        )
    
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error generating responses: {str(e)}")


@app.get("/api/experiments", response_model=List[ExperimentListItem])
async def list_experiments(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """List all experiments"""
    try:
        # Get experiments with response count
        result = await db.execute(
            select(
                Experiment.id,
                Experiment.prompt,
                Experiment.created_at,
                func.count(Response.id).label('response_count')
            )
            .outerjoin(Response)
            .group_by(Experiment.id)
            .order_by(Experiment.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        
        experiments = result.all()
        
        return [
            ExperimentListItem(
                id=exp.id,
                prompt=exp.prompt,
                created_at=exp.created_at,
                response_count=exp.response_count
            )
            for exp in experiments
        ]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching experiments: {str(e)}")


@app.get("/api/experiments/{experiment_id}", response_model=ExperimentResponse)
async def get_experiment(
    experiment_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get specific experiment with all responses"""
    try:
        # Get experiment
        result = await db.execute(
            select(Experiment).where(Experiment.id == experiment_id)
        )
        experiment = result.scalar_one_or_none()
        
        if not experiment:
            raise HTTPException(status_code=404, detail="Experiment not found")
        
        # Get responses
        result = await db.execute(
            select(Response)
            .where(Response.experiment_id == experiment_id)
            .order_by(Response.temperature, Response.top_p)
        )
        responses = result.scalars().all()
        
        return ExperimentResponse(
            id=experiment.id,
            prompt=experiment.prompt,
            created_at=experiment.created_at,
            responses=[
                ResponseData(
                    id=resp.id,
                    temperature=resp.temperature,
                    top_p=resp.top_p,
                    model=resp.model,
                    content=resp.content,
                    metrics=ResponseMetricsSchema(**resp.metrics) if resp.metrics else None,
                    created_at=resp.created_at
                )
                for resp in responses
            ]
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching experiment: {str(e)}")


@app.delete("/api/experiments/{experiment_id}")
async def delete_experiment(
    experiment_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Delete an experiment"""
    try:
        result = await db.execute(
            select(Experiment).where(Experiment.id == experiment_id)
        )
        experiment = result.scalar_one_or_none()
        
        if not experiment:
            raise HTTPException(status_code=404, detail="Experiment not found")
        
        await db.delete(experiment)
        await db.commit()
        
        return {"message": "Experiment deleted successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting experiment: {str(e)}")


@app.post("/api/export")
async def export_experiments(
    request: ExportRequest,
    db: AsyncSession = Depends(get_db)
):
    """Export experiments to JSON or CSV format"""
    try:
        # Get experiments
        result = await db.execute(
            select(Experiment).where(Experiment.id.in_(request.experiment_ids))
        )
        experiments = result.scalars().all()
        
        if not experiments:
            raise HTTPException(status_code=404, detail="No experiments found")
        
        # Get all responses
        result = await db.execute(
            select(Response).where(Response.experiment_id.in_(request.experiment_ids))
        )
        responses = result.scalars().all()
        
        # Organize data
        export_data = []
        for experiment in experiments:
            exp_responses = [r for r in responses if r.experiment_id == experiment.id]
            
            for response in exp_responses:
                export_data.append({
                    "experiment_id": experiment.id,
                    "prompt": experiment.prompt,
                    "temperature": response.temperature,
                    "top_p": response.top_p,
                    "model": response.model,
                    "content": response.content,
                    "created_at": response.created_at.isoformat(),
                    **{f"metric_{k}": v for k, v in (response.metrics or {}).items()}
                })
        
        if request.format == "json":
            return {"data": export_data, "format": "json"}
        else:  # CSV
            if not export_data:
                return {"data": "", "format": "csv"}
            
            # Create CSV
            output = io.StringIO()
            fieldnames = export_data[0].keys()
            writer = csv.DictWriter(output, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(export_data)
            
            return {"data": output.getvalue(), "format": "csv"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error exporting data: {str(e)}")


@app.get("/api/metrics/info")
async def get_metrics_info():
    """Get information about available quality metrics"""
    return {
        "metrics": [
            {
                "name": "coherence_score",
                "description": "Measures text coherence based on transition words and repetition patterns",
                "range": "0.0 to 1.0",
                "rationale": "Coherent text uses transition words and avoids excessive repetition"
            },
            {
                "name": "lexical_diversity",
                "description": "Type-Token Ratio (TTR) - ratio of unique words to total words",
                "range": "0.0 to 1.0",
                "rationale": "Higher diversity indicates richer vocabulary and less repetitive responses"
            },
            {
                "name": "completeness_score",
                "description": "Assesses if response appears complete based on structural cues",
                "range": "0.0 to 1.0",
                "rationale": "Complete responses end with proper punctuation and have logical conclusions"
            },
            {
                "name": "structure_score",
                "description": "Evaluates structural quality (paragraphs, lists, formatting)",
                "range": "0.0 to 1.0",
                "rationale": "Well-structured responses use paragraphs, lists, and proper formatting"
            },
            {
                "name": "readability_score",
                "description": "Simplified Flesch Reading Ease approximation",
                "range": "0.0 to 1.0",
                "rationale": "Readable text balances sentence and word length appropriately"
            },
            {
                "name": "length_appropriateness",
                "description": "Evaluates if response length is appropriate",
                "range": "0.0 to 1.0",
                "rationale": "Quality responses are typically 75-300 words (optimal range)"
            },
            {
                "name": "overall_score",
                "description": "Weighted average of all metrics",
                "range": "0.0 to 1.0",
                "rationale": "Provides a single quality indicator prioritizing coherence and completeness"
            }
        ]
    }
