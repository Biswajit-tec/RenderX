import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
    Maximize, Minimize, PictureInPicture2, Download, Settings
} from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { PLAYBACK_SPEEDS } from '../lib/constants';

/**
 * Custom Video Player with full controls
 */
export function VideoPlayer({ src, jobId }) {
    const videoRef = useRef(null);
    const progressRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => setCurrentTime(video.currentTime);
        const handleLoadedMetadata = () => setDuration(video.duration);
        const handleEnded = () => setIsPlaying(false);

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('ended', handleEnded);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('ended', handleEnded);
        };
    }, []);

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const togglePlay = () => {
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    const handleProgressClick = (e) => {
        const rect = progressRef.current.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        videoRef.current.currentTime = percent * duration;
    };

    const skip = (seconds) => {
        videoRef.current.currentTime = Math.min(
            Math.max(videoRef.current.currentTime + seconds, 0),
            duration
        );
    };

    const toggleMute = () => {
        if (isMuted) {
            videoRef.current.volume = volume || 0.5;
            setIsMuted(false);
        } else {
            videoRef.current.volume = 0;
            setIsMuted(true);
        }
    };

    const handleSpeedChange = (speed) => {
        setPlaybackSpeed(speed);
        videoRef.current.playbackRate = speed;
        setShowSpeedMenu(false);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            videoRef.current.parentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const togglePiP = async () => {
        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else if (document.pictureInPictureEnabled) {
                await videoRef.current.requestPictureInPicture();
            }
        } catch (error) {
            console.error('PiP error:', error);
        }
    };

    const handleDownload = () => {
        window.open(`http://localhost:8000/download/${jobId}`, '_blank');
    };

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <Card className="overflow-hidden">
                <div className="p-4 flex items-center justify-between border-b border-white/10">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Play className="w-5 h-5 text-purple-400" />
                        Processed Video
                    </h3>
                    <Button variant="success" size="sm" onClick={handleDownload}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                    </Button>
                </div>

                <CardContent className="p-0">
                    {/* Video Container */}
                    <div
                        className="relative group bg-black"
                        onMouseEnter={() => setShowControls(true)}
                        onMouseLeave={() => setShowControls(isPlaying ? false : true)}
                    >
                        <video
                            ref={videoRef}
                            src={src}
                            className="w-full aspect-video"
                            onClick={togglePlay}
                        />

                        {/* Controls Overlay */}
                        <motion.div
                            initial={false}
                            animate={{ opacity: showControls || !isPlaying ? 1 : 0 }}
                            className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent"
                        >
                            {/* Progress Bar */}
                            <div
                                ref={progressRef}
                                onClick={handleProgressClick}
                                className="w-full h-1.5 bg-white/20 rounded-full mb-4 cursor-pointer group/progress"
                            >
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full relative transition-all"
                                    style={{ width: `${progressPercent}%` }}
                                >
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity" />
                                </div>
                            </div>

                            {/* Controls Row */}
                            <div className="flex items-center justify-between">
                                {/* Left Controls */}
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => skip(-10)}>
                                        <SkipBack className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={togglePlay}>
                                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => skip(10)}>
                                        <SkipForward className="w-4 h-4" />
                                    </Button>
                                    <span className="text-sm text-gray-400 ml-2 font-mono">
                                        {formatTime(currentTime)} / {formatTime(duration)}
                                    </span>
                                </div>

                                {/* Right Controls */}
                                <div className="flex items-center gap-1">
                                    {/* Volume */}
                                    <Button variant="ghost" size="icon" onClick={toggleMute}>
                                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                    </Button>

                                    {/* Speed */}
                                    <div className="relative">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                                            className="text-xs font-mono"
                                        >
                                            {playbackSpeed}x
                                        </Button>
                                        {showSpeedMenu && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="absolute bottom-full right-0 mb-2 py-1 bg-gray-900 rounded-lg border border-white/10 shadow-xl"
                                            >
                                                {PLAYBACK_SPEEDS.map((speed) => (
                                                    <button
                                                        key={speed}
                                                        onClick={() => handleSpeedChange(speed)}
                                                        className={`block w-full px-4 py-1.5 text-sm text-left hover:bg-white/10 ${playbackSpeed === speed ? 'text-purple-400' : 'text-gray-300'
                                                            }`}
                                                    >
                                                        {speed}x
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* PiP */}
                                    <Button variant="ghost" size="icon" onClick={togglePiP}>
                                        <PictureInPicture2 className="w-4 h-4" />
                                    </Button>

                                    {/* Fullscreen */}
                                    <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                                        {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Play button overlay when paused */}
                        {!isPlaying && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={togglePlay}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-purple-500/90 flex items-center justify-center hover:bg-purple-400 transition-colors"
                            >
                                <Play className="w-8 h-8 text-white ml-1" />
                            </motion.button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
