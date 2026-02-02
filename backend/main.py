"""
FastAPI Backend for Real-Time Distributed Video Rendering
Handles video upload, processing coordination, and results delivery
"""

import os
import uuid
import shutil
import json
import logging
from typing import Dict, Optional
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import asyncio
from concurrent.futures import ProcessPoolExecutor
from video_processor import VideoProcessor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Video Rendering API")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Storage directories
UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"
JOBS_FILE = "jobs.json"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Job storage with persistence
jobs: Dict[str, dict] = {}

def load_jobs():
    """Load jobs from disk"""
    global jobs
    try:
        if os.path.exists(JOBS_FILE):
            with open(JOBS_FILE, 'r') as f:
                jobs = json.load(f)
                logger.info(f"Loaded {len(jobs)} jobs from disk")
    except Exception as e:
        logger.error(f"Error loading jobs: {e}")
        jobs = {}

def save_jobs():
    """Save jobs to disk"""
    try:
        with open(JOBS_FILE, 'w') as f:
            json.dump(jobs, f, indent=2)
        logger.info(f"Saved {len(jobs)} jobs to disk")
    except Exception as e:
        logger.error(f"Error saving jobs: {e}")

# Load existing jobs on startup
load_jobs()

# Process executor for background processing
executor = ProcessPoolExecutor(max_workers=1)

# Configuration
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB
ALLOWED_EXTENSIONS = {'.mp4'}


class ProcessRequest(BaseModel):
    """Request model for video processing"""
    job_id: str
    filter_type: str  # 'grayscale' or 'blur'


class JobStatus(BaseModel):
    """Response model for job status"""
    job_id: str
    status: str  # 'queued', 'processing', 'completed', 'failed'
    progress: Optional[int] = None
    sequential_time: Optional[float] = None
    parallel_time: Optional[float] = None
    speedup: Optional[float] = None
    segments_processed: Optional[int] = None
    cpu_cores_used: Optional[int] = None
    output_filename: Optional[str] = None
    error: Optional[str] = None


def validate_video_file(filename: str, file_size: int) -> bool:
    """
    Validate uploaded video file
    
    Args:
        filename: Name of the uploaded file
        file_size: Size of the file in bytes
        
    Returns:
        True if valid, raises HTTPException otherwise
    """
    # Check file extension
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Only {', '.join(ALLOWED_EXTENSIONS)} allowed"
        )
    
    # Check file size
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    return True


def process_video_task(job_id: str, video_path: str, filter_type: str):
    """
    Background task for video processing
    This runs in a separate process
    
    Args:
        job_id: Unique job identifier
        video_path: Path to uploaded video
        filter_type: Filter to apply
    """
    try:
        # Create processor instance
        processor = VideoProcessor(video_path)
        
        # Process the video
        output_filename = f"{job_id}_processed.mp4"
        result = processor.process_video(filter_type, output_filename)
        
        return {
            'job_id': job_id,
            'result': result
        }
        
    except Exception as e:
        return {
            'job_id': job_id,
            'result': {
                'success': False,
                'error': str(e)
            }
        }


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Video Rendering API",
        "version": "1.0.0"
    }


@app.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    """
    Upload a video file
    
    Args:
        file: Video file to upload
        
    Returns:
        Job ID for tracking the upload
    """
    # Read file to check size
    contents = await file.read()
    file_size = len(contents)
    
    # Validate file
    validate_video_file(file.filename, file_size)
    
    # Generate unique job ID
    job_id = str(uuid.uuid4())
    
    # Save uploaded file
    file_path = os.path.join(UPLOAD_DIR, f"{job_id}_{file.filename}")
    with open(file_path, "wb") as f:
        f.write(contents)
    
    # Get video analytics
    try:
        processor = VideoProcessor(file_path)
        analytics = processor.get_video_analytics()
        logger.info(f"Extracted analytics for {job_id}")
    except Exception as e:
        logger.error(f"Error extracting analytics: {e}")
        analytics = None
    
    # Create job record
    jobs[job_id] = {
        'job_id': job_id,
        'status': 'uploaded',
        'filename': file.filename,
        'file_path': file_path,
        'filter_type': None,
        'analytics': analytics
    }
    
    # Save to disk
    save_jobs()
    
    logger.info(f"Job {job_id} created and saved")
    
    return {
        "job_id": job_id,
        "filename": file.filename,
        "size": file_size,
        "analytics": analytics,
        "message": "Video uploaded successfully"
    }


@app.post("/process")
async def start_processing(request: ProcessRequest):
    """
    Start video processing
    
    Args:
        request: Processing request with job_id and filter_type
        
    Returns:
        Confirmation message
    """
    job_id = request.job_id
    filter_type = request.filter_type
    
    # Validate job exists
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = jobs[job_id]
    
    # Validate filter type
    valid_filters = ['grayscale', 'blur', 'sepia', 'brightness', 'contrast', 
                     'saturation', 'warm_tone', 'cool_tone', 'edge_detection']
    if filter_type not in valid_filters:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid filter type. Use one of: {', '.join(valid_filters)}"
        )
    
    # Update job status
    job['status'] = 'processing'
    job['filter_type'] = filter_type
    save_jobs()
    
    logger.info(f"Started processing job {job_id} with filter: {filter_type}")
    
    # Start background processing
    asyncio.create_task(process_in_background(job_id, job['file_path'], filter_type))
    
    return {
        "message": "Processing started",
        "job_id": job_id,
        "filter_type": filter_type
    }


async def process_in_background(job_id: str, video_path: str, filter_type: str):
    """
    Async wrapper for background processing
    
    Args:
        job_id: Job identifier
        video_path: Path to video file
        filter_type: Filter to apply
    """
    loop = asyncio.get_event_loop()
    
    try:
        logger.info(f"Background processing started for job {job_id}")
        
        # Run processing in separate process
        result_data = await loop.run_in_executor(
            executor,
            process_video_task,
            job_id,
            video_path,
            filter_type
        )
        
        result = result_data['result']
        job = jobs[job_id]
        
        if result['success']:
            # Update job with results
            job['status'] = 'completed'
            job['sequential_time'] = result['sequential_time']
            job['parallel_time'] = result['parallel_time']
            job['speedup'] = result['speedup']
            job['segments_processed'] = result['segments_processed']
            job['cpu_cores_used'] = result['cpu_cores_used']
            job['output_filename'] = os.path.basename(result['output_path'])
            job['output_path'] = result['output_path']
            logger.info(f"Job {job_id} completed successfully")
        else:
            job['status'] = 'failed'
            job['error'] = result.get('error', 'Unknown error')
            logger.error(f"Job {job_id} failed: {job.get('error')}")
        
        # Save to disk
        save_jobs()
            
    except Exception as e:
        logger.error(f"Background processing error for job {job_id}: {e}")
        jobs[job_id]['status'] = 'failed'
        jobs[job_id]['error'] = str(e)
        save_jobs()


@app.get("/status/{job_id}")
async def get_status(job_id: str):
    """
    Get processing status for a job
    
    Args:
        job_id: Job identifier
        
    Returns:
        Job status and results
    """
    if job_id not in jobs:
        logger.warning(f"Job {job_id} not found. Available jobs: {list(jobs.keys())}")
        raise HTTPException(
            status_code=404, 
            detail=f"Job not found. Please upload a video first. Job ID: {job_id}"
        )
    
    job = jobs[job_id]
    logger.info(f"Status check for job {job_id}: {job['status']}")
    
    return JobStatus(
        job_id=job_id,
        status=job['status'],
        sequential_time=job.get('sequential_time'),
        parallel_time=job.get('parallel_time'),
        speedup=job.get('speedup'),
        segments_processed=job.get('segments_processed'),
        cpu_cores_used=job.get('cpu_cores_used'),
        output_filename=job.get('output_filename'),
        error=job.get('error')
    )


@app.get("/download/{job_id}")
async def download_video(job_id: str):
    """
    Download processed video
    
    Args:
        job_id: Job identifier
        
    Returns:
        Processed video file
    """
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = jobs[job_id]
    
    if job['status'] != 'completed':
        raise HTTPException(
            status_code=400,
            detail=f"Video not ready. Current status: {job['status']}"
        )
    
    output_path = job.get('output_path')
    if not output_path or not os.path.exists(output_path):
        raise HTTPException(status_code=404, detail="Output file not found")
    
    return FileResponse(
        output_path,
        media_type="video/mp4",
        filename=job['output_filename']
    )


@app.delete("/cleanup/{job_id}")
async def cleanup_job(job_id: str):
    """
    Clean up job files (optional endpoint)
    
    Args:
        job_id: Job identifier
        
    Returns:
        Confirmation message
    """
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = jobs[job_id]
    
    # Remove uploaded file
    if 'file_path' in job and os.path.exists(job['file_path']):
        os.remove(job['file_path'])
        logger.info(f"Removed uploaded file for job {job_id}")
    
    # Remove output file
    if 'output_path' in job and os.path.exists(job['output_path']):
        os.remove(job['output_path'])
        logger.info(f"Removed output file for job {job_id}")
    
    # Remove job from memory and disk
    del jobs[job_id]
    save_jobs()
    
    logger.info(f"Job {job_id} cleaned up successfully")
    
    return {"message": "Job cleaned up successfully"}


@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources on shutdown"""
    executor.shutdown(wait=True)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
