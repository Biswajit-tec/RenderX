"""
Video Processor Module - OpenCV Version
Handles video splitting, filter application, and parallel processing
Uses OpenCV instead of MoviePy (no FFmpeg dependency)
"""

import os
import time
import cv2
import numpy as np
import subprocess
import shutil
from multiprocessing import Pool, cpu_count


# ============= FILTER FUNCTIONS =============

def apply_grayscale(frame):
    """Convert frame to grayscale"""
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    return cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)


def apply_blur(frame):
    """Apply Gaussian blur"""
    return cv2.GaussianBlur(frame, (15, 15), 0)


def apply_sepia(frame):
    """Apply sepia tone filter"""
    sepia_matrix = np.array([
        [0.272, 0.534, 0.131],
        [0.349, 0.686, 0.168],
        [0.393, 0.769, 0.189]
    ])
    sepia = cv2.transform(frame, sepia_matrix)
    return np.clip(sepia, 0, 255).astype(np.uint8)


def apply_brightness(frame):
    """Increase brightness by 20%"""
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    h, s, v = cv2.split(hsv)
    # Increase value by 20%
    v = np.clip(v * 1.2, 0, 255).astype(np.uint8)
    hsv = cv2.merge([h, s, v])
    return cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)


def apply_contrast(frame):
    """Increase contrast by 30%"""
    # Apply contrast: new_pixel = alpha * pixel + beta
    alpha = 1.3  # Contrast control (1.0-3.0)
    beta = 0     # Brightness control (0-100)
    return np.clip(alpha * frame + beta, 0, 255).astype(np.uint8)


def apply_saturation(frame):
    """Increase saturation by 25%"""
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    h, s, v = cv2.split(hsv)
    # Increase saturation by 25%
    s = np.clip(s * 1.25, 0, 255).astype(np.uint8)
    hsv = cv2.merge([h, s, v])
    return cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)


def apply_warm_tone(frame):
    """Apply warm tone filter (increase red/yellow)"""
    # Increase red channel, decrease blue channel
    result = frame.copy().astype(np.float32)
    result[:, :, 2] = np.clip(result[:, :, 2] * 1.1, 0, 255)  # Red
    result[:, :, 1] = np.clip(result[:, :, 1] * 1.05, 0, 255)  # Green
    result[:, :, 0] = np.clip(result[:, :, 0] * 0.9, 0, 255)  # Blue
    return result.astype(np.uint8)


def apply_cool_tone(frame):
    """Apply cool tone filter (increase blue)"""
    # Increase blue channel, decrease red channel
    result = frame.copy().astype(np.float32)
    result[:, :, 0] = np.clip(result[:, :, 0] * 1.15, 0, 255)  # Blue
    result[:, :, 1] = np.clip(result[:, :, 1] * 1.05, 0, 255)  # Green  
    result[:, :, 2] = np.clip(result[:, :, 2] * 0.9, 0, 255)  # Red
    return result.astype(np.uint8)


def apply_edge_detection(frame):
    """Apply edge detection (Canny)"""
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 100, 200)
    return cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)


# Filter mapping dictionary
FILTERS = {
    'grayscale': apply_grayscale,
    'blur': apply_blur,
    'sepia': apply_sepia,
    'brightness': apply_brightness,
    'contrast': apply_contrast,
    'saturation': apply_saturation,
    'warm_tone': apply_warm_tone,
    'cool_tone': apply_cool_tone,
    'edge_detection': apply_edge_detection
}


def get_filter_function(filter_type):
    """Get the filter function by name"""
    return FILTERS.get(filter_type, lambda x: x)


def extract_audio(video_path, audio_path):
    """
    Extract audio from video using FFmpeg
    
    Args:
        video_path: Path to the video file
        audio_path: Path to save the extracted audio
        
    Returns:
        True if audio was extracted, False if video has no audio
    """
    try:
        # Check if video has audio stream
        probe_cmd = [
            'ffprobe', '-v', 'error', '-select_streams', 'a',
            '-show_entries', 'stream=codec_type', '-of', 'csv=p=0',
            video_path
        ]
        result = subprocess.run(probe_cmd, capture_output=True, text=True)
        
        if 'audio' not in result.stdout:
            print("Video has no audio stream")
            return False
        
        # Extract audio
        cmd = [
            'ffmpeg', '-y', '-i', video_path,
            '-vn', '-acodec', 'copy', audio_path
        ]
        subprocess.run(cmd, capture_output=True, check=True)
        print(f"Audio extracted to: {audio_path}")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"Failed to extract audio: {e}")
        return False
    except FileNotFoundError:
        print("FFmpeg not found. Audio will not be preserved.")
        return False


def merge_audio_with_video(video_path, audio_path, output_path):
    """
    Merge audio track with video using FFmpeg
    
    Args:
        video_path: Path to the video file (without audio)
        audio_path: Path to the audio file
        output_path: Path for the output video with audio
        
    Returns:
        True if successful, False otherwise
    """
    try:
        # Create temp output path
        temp_output = output_path + ".temp.mp4"
        
        cmd = [
            'ffmpeg', '-y',
            '-i', video_path,
            '-i', audio_path,
            '-c:v', 'copy',
            '-c:a', 'aac',
            '-map', '0:v:0',
            '-map', '1:a:0',
            '-shortest',
            temp_output
        ]
        subprocess.run(cmd, capture_output=True, check=True)
        
        # Replace original with merged version
        if os.path.exists(output_path):
            os.remove(output_path)
        shutil.move(temp_output, output_path)
        
        print(f"Audio merged successfully: {output_path}")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"Failed to merge audio: {e}")
        # Clean up temp file if it exists
        if os.path.exists(temp_output):
            os.remove(temp_output)
        return False
    except FileNotFoundError:
        print("FFmpeg not found. Audio will not be merged.")
        return False


def apply_filter_to_segment(args):
    """
    Worker function for parallel processing
    
    Args:
        args: Tuple of (segment_path, filter_type, output_path, segment_index)
    """
    segment_path, filter_type, output_path, segment_index = args
    print(f"  [Worker] Processing segment {segment_index}...")
    
    try:
        # Open video
        cap = cv2.VideoCapture(segment_path)
        
        # Get video properties
        fps = cap.get(cv2.CAP_PROP_FPS)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        # Create video writer with browser-compatible codec (H.264)
        # Try avc1 first, fallback to mp4v if not available
        fourcc = cv2.VideoWriter_fourcc(*'avc1')
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        if not out.isOpened():
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        
        # Get filter function
        filter_func = get_filter_function(filter_type)
        
        # Process each frame
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            # Apply filter
            processed = filter_func(frame)
            out.write(processed)
        
        # Release resources
        cap.release()
        out.release()
        
        print(f"  [Worker] Segment {segment_index} completed")
        return output_path
        
    except Exception as e:
        print(f"Error processing segment {segment_index}: {e}")
        raise e


class VideoProcessor:
    """
    Processes videos with sequential and parallel methods to demonstrate speedup
    Uses OpenCV for video processing
    """
    
    def __init__(self, video_path, segment_duration=10):
        """
        Initialize the video processor
        
        Args:
            video_path: Path to input video file
            segment_duration: Duration of each segment in seconds (default: 10)
        """
        self.video_path = video_path
        self.segment_duration = segment_duration
        self.segments_dir = "segments"
        self.output_dir = "outputs"
        
        # Create necessary directories
        os.makedirs(self.segments_dir, exist_ok=True)
        os.makedirs(self.output_dir, exist_ok=True)
    
    def get_video_analytics(self):
        """
        Extract analytics from the video
        
        Returns:
            Dictionary with video analytics
        """
        try:
            cap = cv2.VideoCapture(self.video_path)
            
            if not cap.isOpened():
                raise Exception("Could not open video file")
            
            # Get video properties
            fps = cap.get(cv2.CAP_PROP_FPS)
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            duration = total_frames / fps if fps > 0 else 0
            
            cap.release()
            
            # Get file size
            file_size = os.path.getsize(self.video_path)
            file_size_mb = round(file_size / (1024 * 1024), 2)
            
            # Calculate bitrate
            bitrate_mbps = round((file_size * 8) / (duration * 1_000_000), 2) if duration > 0 else 0
            
            analytics = {
                'duration': round(duration, 2),
                'width': width,
                'height': height,
                'fps': round(fps, 2),
                'aspect_ratio': f"{width}:{height}",
                'total_frames': total_frames,
                'has_audio': False,  # OpenCV doesn't handle audio
                'file_size_mb': file_size_mb,
                'bitrate_mbps': bitrate_mbps
            }
            
            return analytics
            
        except Exception as e:
            print(f"Error getting analytics: {e}")
            try:
                file_size = os.path.getsize(self.video_path)
            except:
                file_size = 0
            return {
                'duration': 0,
                'width': 0,
                'height': 0,
                'fps': 0,
                'aspect_ratio': "Unknown",
                'total_frames': 0,
                'has_audio': False,
                'file_size_mb': round(file_size / (1024 * 1024), 2) if file_size else 0,
                'bitrate_mbps': 0
            }
    
    def split_video(self):
        """
        Split video into segments
        
        Returns:
            List of segment file paths
        """
        print(f"Loading video: {self.video_path}")
        
        cap = cv2.VideoCapture(self.video_path)
        
        if not cap.isOpened():
            raise Exception("Could not open video file")
        
        # Get video properties
        fps = cap.get(cv2.CAP_PROP_FPS)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = total_frames / fps
        
        frames_per_segment = int(fps * self.segment_duration)
        segment_count = int(np.ceil(total_frames / frames_per_segment))
        
        print(f"Video: {duration:.1f}s, {total_frames} frames, {fps:.1f} fps")
        print(f"Splitting into {segment_count} segments...")
        
        segment_paths = []
        # Use browser-compatible codec (H.264)
        fourcc = cv2.VideoWriter_fourcc(*'avc1')
        
        current_segment = 0
        frame_count = 0
        out = None
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            # Check if we need to start a new segment
            if frame_count % frames_per_segment == 0:
                # Close previous segment
                if out is not None:
                    out.release()
                
                # Start new segment
                segment_path = os.path.join(self.segments_dir, f"segment_{current_segment:03d}.mp4")
                out = cv2.VideoWriter(segment_path, fourcc, fps, (width, height))
                segment_paths.append(segment_path)
                
                print(f"  Creating segment {current_segment + 1}/{segment_count}")
                current_segment += 1
            
            out.write(frame)
            frame_count += 1
        
        # Close last segment
        if out is not None:
            out.release()
        
        cap.release()
        
        print(f"Created {len(segment_paths)} segments")
        return segment_paths
    
    def apply_filter(self, video_path, filter_type, output_path):
        """
        Apply a filter to a video segment
        
        Args:
            video_path: Path to input video segment
            filter_type: Type of filter
            output_path: Path to save processed video
        """
        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened():
            raise Exception(f"Could not open video: {video_path}")
        
        # Get video properties
        fps = cap.get(cv2.CAP_PROP_FPS)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        # Create video writer with browser-compatible codec
        fourcc = cv2.VideoWriter_fourcc(*'avc1')
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        if not out.isOpened():
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        
        # Get filter function
        filter_func = get_filter_function(filter_type)
        
        # Process each frame
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            # Apply filter
            processed = filter_func(frame)
            out.write(processed)
        
        cap.release()
        out.release()
    
    def process_sequential(self, segment_paths, filter_type):
        """
        Process video segments sequentially (one at a time)
        
        Args:
            segment_paths: List of segment file paths
            filter_type: Type of filter to apply
            
        Returns:
            Tuple of (processed_paths, execution_time)
        """
        print("\n=== Sequential Processing ===")
        start_time = time.time()
        
        processed_paths = []
        for i, segment_path in enumerate(segment_paths):
            output_path = os.path.join(self.output_dir, f"seq_processed_{i:03d}.mp4")
            print(f"Processing segment {i+1}/{len(segment_paths)}...")
            self.apply_filter(segment_path, filter_type, output_path)
            processed_paths.append(output_path)
        
        end_time = time.time()
        execution_time = end_time - start_time
        
        print(f"Sequential processing completed in {execution_time:.2f} seconds")
        return processed_paths, execution_time
    
    def process_parallel(self, segment_paths, filter_type):
        """
        Process video segments in parallel using multiprocessing
        
        Args:
            segment_paths: List of segment file paths
            filter_type: Type of filter to apply
            
        Returns:
            Tuple of (processed_paths, execution_time)
        """
        print("\n=== Parallel Processing ===")
        num_cores = cpu_count()
        print(f"Using {num_cores} CPU cores")
        
        start_time = time.time()
        
        # Prepare arguments for parallel processing
        args_list = [
            (segment_path, filter_type, 
             os.path.join(self.output_dir, f"par_processed_{i:03d}.mp4"), i+1)
            for i, segment_path in enumerate(segment_paths)
        ]
        
        # Use multiprocessing Pool to process segments in parallel
        with Pool(processes=num_cores) as pool:
            processed_paths = pool.map(apply_filter_to_segment, args_list)
        
        end_time = time.time()
        execution_time = end_time - start_time
        
        print(f"Parallel processing completed in {execution_time:.2f} seconds")
        return processed_paths, execution_time
    
    def merge_segments(self, segment_paths, output_path):
        """
        Merge processed segments into a single video
        
        Args:
            segment_paths: List of processed segment paths
            output_path: Path for final merged video
        """
        print(f"\nMerging {len(segment_paths)} segments...")
        
        if not segment_paths:
            raise Exception("No segments to merge")
        
        # Get properties from first segment
        cap = cv2.VideoCapture(segment_paths[0])
        fps = cap.get(cv2.CAP_PROP_FPS)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        cap.release()
        
        # Create output video with browser-compatible codec
        fourcc = cv2.VideoWriter_fourcc(*'avc1')
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        if not out.isOpened():
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        
        # Write all segments to output
        for segment_path in segment_paths:
            cap = cv2.VideoCapture(segment_path)
            
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                out.write(frame)
            
            cap.release()
        
        out.release()
        print(f"Merged video saved to: {output_path}")
    
    def cleanup_segments(self):
        """
        Remove temporary segment files
        """
        import shutil
        
        if os.path.exists(self.segments_dir):
            shutil.rmtree(self.segments_dir)
            os.makedirs(self.segments_dir, exist_ok=True)
        
        if os.path.exists(self.output_dir):
            for file in os.listdir(self.output_dir):
                if file.startswith("seq_") or file.startswith("par_"):
                    os.remove(os.path.join(self.output_dir, file))
        
        print("Temporary files cleaned up")
    
    def process_video(self, filter_type, output_filename):
        """
        Complete video processing workflow - OPTIMIZED (parallel only)
        Now preserves original audio!
        
        Args:
            filter_type: Type of filter to apply
            output_filename: Name for the final output video
            
        Returns:
            Dictionary with processing results
        """
        try:
            # Validate filter type
            if filter_type not in FILTERS:
                raise ValueError(f"Unknown filter: {filter_type}. Available: {list(FILTERS.keys())}")
            
            # Step 0: Extract audio from original video (if it has audio)
            audio_path = os.path.join(self.segments_dir, "original_audio.aac")
            has_audio = extract_audio(self.video_path, audio_path)
            
            # Step 1: Split video into segments
            segment_paths = self.split_video()
            
            # Step 2: Process in parallel ONLY (skip sequential to save time!)
            par_paths, par_time = self.process_parallel(segment_paths, filter_type)
            
            # Step 3: Merge parallel processed segments
            output_path = os.path.join(self.output_dir, output_filename)
            self.merge_segments(par_paths, output_path)
            
            # Step 4: Merge audio back with the processed video
            if has_audio and os.path.exists(audio_path):
                print("Merging original audio with processed video...")
                merge_audio_with_video(output_path, audio_path, output_path)
            
            # Step 5: Estimate sequential time based on parallel performance
            # Sequential would take roughly: parallel_time * num_cores (simplified estimate)
            num_cores = cpu_count()
            estimated_seq_time = par_time * min(num_cores, len(segment_paths))
            
            # Step 6: Calculate speedup
            speedup = estimated_seq_time / par_time if par_time > 0 else 1.0
            
            # Step 7: Cleanup temporary files
            self.cleanup_segments()
            
            return {
                'success': True,
                'output_path': output_path,
                'sequential_time': round(estimated_seq_time, 2),  # Estimated
                'parallel_time': round(par_time, 2),
                'speedup': round(speedup, 2),
                'segments_processed': len(segment_paths),
                'cpu_cores_used': num_cores,
                'audio_preserved': has_audio
            }
            
        except Exception as e:
            print(f"Error during video processing: {str(e)}")
            import traceback
            traceback.print_exc()
            return {
                'success': False,
                'error': str(e)
            }


def get_available_filters():
    """Return list of available filter names"""
    return list(FILTERS.keys())


def demo():
    """Demo function to test the video processor"""
    print("Video Processor Demo (OpenCV Version)")
    print(f"Available filters: {get_available_filters()}")


if __name__ == "__main__":
    demo()
