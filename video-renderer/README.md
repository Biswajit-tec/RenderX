# Real-Time Distributed Video Rendering

A full-stack hackathon project demonstrating how parallel processing speeds up video rendering using Python multiprocessing.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![Python](https://img.shields.io/badge/python-3.8+-blue.svg)
![React](https://img.shields.io/badge/react-18-blue.svg)

## 🎯 Overview

This project showcases the performance benefits of parallel processing for video rendering tasks. Users can upload a video, apply filters (grayscale or blur), and compare the processing time between sequential and parallel execution.

**Key Features:**
- Upload MP4 videos (up to 100MB)
- Choose between grayscale and blur filters
- Automatic video segmentation (10-second chunks)
- Side-by-side comparison of sequential vs parallel processing times
- Real-time speedup calculation
- Download processed videos

## 🏗️ Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────────┐
│   React     │  HTTP   │   FastAPI    │  Exec   │  Multiprocessing│
│  Frontend   │────────▶│   Backend    │────────▶│  Video Processor│
│  (Port 3000)│         │  (Port 8000) │         │  (MoviePy)      │
└─────────────┘         └──────────────┘         └─────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Vite** - Build tool

### Backend
- **FastAPI** - Web framework
- **MoviePy** - Video processing
- **Python multiprocessing** - Parallel execution
- **Uvicorn** - ASGI server

## 📁 Folder Structure

```
video-renderer/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── video_processor.py   # Video processing logic
│   ├── requirements.txt     # Python dependencies
│   ├── uploads/            # Uploaded videos (created at runtime)
│   ├── segments/           # Temporary video segments
│   └── outputs/            # Processed videos
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Main React component
│   │   ├── main.jsx        # React entry point
│   │   └── index.css       # Tailwind CSS
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites

- **Python 3.8+** installed
- **Node.js 16+** and npm installed
- **FFmpeg** installed (required by MoviePy)

#### Installing FFmpeg:

**Windows:**
```bash
# Using Chocolatey
choco install ffmpeg

# Or download from https://ffmpeg.org/download.html
```

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt-get install ffmpeg
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd video-renderer/backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
```

3. Activate the virtual environment:

**Windows:**
```bash
venv\Scripts\activate
```

**macOS/Linux:**
```bash
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Run the FastAPI server:
```bash
uvicorn main:app --reload
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd video-renderer/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 📖 Usage Guide

1. **Open the application** in your browser at `http://localhost:3000`

2. **Upload a video:**
   - Click the upload zone or drag and drop an MP4 file
   - Maximum file size: 100MB

3. **Select a filter:**
   - Choose between Grayscale or Blur

4. **Start processing:**
   - Click "Start Processing" button
   - Wait for both sequential and parallel processing to complete

5. **View results:**
   - Compare sequential vs parallel processing times
   - See the speedup factor
   - Preview the processed video
   - Download the final video

## 🔌 API Documentation

### Endpoints

#### `POST /upload`
Upload a video file for processing.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (video file)

**Response:**
```json
{
  "job_id": "uuid-string",
  "filename": "video.mp4",
  "size": 12345678,
  "message": "Video uploaded successfully"
}
```

#### `POST /process`
Start video processing.

**Request:**
```json
{
  "job_id": "uuid-string",
  "filter_type": "grayscale" | "blur"
}
```

**Response:**
```json
{
  "message": "Processing started",
  "job_id": "uuid-string",
  "filter_type": "grayscale"
}
```

#### `GET /status/{job_id}`
Get processing status and results.

**Response:**
```json
{
  "job_id": "uuid-string",
  "status": "completed",
  "sequential_time": 45.67,
  "parallel_time": 12.34,
  "speedup": 3.70,
  "segments_processed": 6,
  "cpu_cores_used": 8,
  "output_filename": "processed.mp4"
}
```

#### `GET /download/{job_id}`
Download the processed video file.

**Response:** Video file (MP4)

## ⚙️ How It Works

### Video Processing Pipeline

1. **Video Upload**
   - User uploads an MP4 file via the web interface
   - Backend validates file type and size
   - File is saved with a unique job ID

2. **Video Segmentation**
   - Original video is split into 10-second segments
   - Each segment is saved as a separate MP4 file

3. **Sequential Processing** (Baseline)
   - Each segment is processed one at a time
   - Filters are applied sequentially
   - Total time is measured

4. **Parallel Processing**
   - Python's `multiprocessing.Pool` is used
   - All CPU cores process segments simultaneously
   - Significantly faster than sequential

5. **Merging**
   - Processed segments are concatenated
   - Final video is saved to the outputs directory

6. **Results**
   - Processing times are compared
   - Speedup factor is calculated
   - User can preview and download the result

### Multiprocessing Implementation

The video processor uses Python's `multiprocessing` module:

```python
from multiprocessing import Pool, cpu_count

# Create a pool with all available CPU cores
with Pool(processes=cpu_count()) as pool:
    # Process all segments in parallel
    processed_paths = pool.map(process_segment, segments)
```

## 🎨 Filters Available

### Grayscale
Converts the video to black and white by removing color information.

### Blur
Applies a Gaussian blur effect to the video, creating a soft, unfocused appearance.

## 📊 Performance Notes

- **Speedup** typically ranges from 2x to 8x depending on:
  - Number of CPU cores available
  - Video length and complexity
  - Filter type selected

- **Memory Usage**: Each parallel worker loads a video segment into memory. For very large videos, this may require significant RAM.

- **Optimal Segment Duration**: 10 seconds balances parallelization benefits with overhead costs.

## 🐛 Troubleshooting

### Backend Issues

**"MoviePy error":**
- Ensure FFmpeg is installed and available in PATH
- Verify FFmpeg installation: `ffmpeg -version`

**"No module named 'moviepy'":**
- Activate virtual environment
- Reinstall dependencies: `pip install -r requirements.txt`

### Frontend Issues

**"Cannot connect to backend":**
- Ensure backend is running on port 8000
- Check CORS settings in `main.py`

**"npm install fails":**
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

## 🔐 Security Notes

⚠️ **This is a hackathon/demo project**. For production use:

- Implement proper authentication
- Add rate limiting
- Validate and sanitize all inputs
- Use a proper database instead of in-memory storage
- Configure CORS to specific origins
- Add file scanning for malware
- Implement proper error logging

## 🚧 Future Enhancements

- [ ] Support for more video formats (AVI, MOV, etc.)
- [ ] Additional filters (sepia, edge detection, color correction)
- [ ] Real-time progress updates during processing
- [ ] Batch processing of multiple videos
- [ ] GPU acceleration using CUDA
- [ ] Distributed processing across multiple machines
- [ ] User accounts and processing history
- [ ] Advanced scheduling and queue management

## 📄 License

This project is for educational and demonstration purposes.

## 🙏 Acknowledgments

- Built with ❤️ for hackathon demonstration
- MoviePy for video processing capabilities
- FastAPI for the excellent web framework
- React and Tailwind CSS for the modern UI

---

**Happy Rendering! 🎬**
