import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Play, Pause, Volume2, VolumeX, Maximize, Download,
    Clock, Image, Film, HardDrive, ArrowLeft, RefreshCw
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import LightRays from '../components/LightRays';

/**
 * Animated Counter Hook
 */
function useCountUp(end, duration = 1.5) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime;
        let frame;
        const animate = (time) => {
            if (!startTime) startTime = time;
            const progress = Math.min((time - startTime) / (duration * 1000), 1);
            setCount(progress * end);
            if (progress < 1) frame = requestAnimationFrame(animate);
        };
        frame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame);
    }, [end, duration]);

    return count;
}

/**
 * Video Player Component
 */
function VideoPlayer({ src, jobId }) {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTime = () => setCurrentTime(video.currentTime);
        const handleMeta = () => setDuration(video.duration);
        const handleEnd = () => setIsPlaying(false);

        video.addEventListener('timeupdate', handleTime);
        video.addEventListener('loadedmetadata', handleMeta);
        video.addEventListener('ended', handleEnd);

        return () => {
            video.removeEventListener('timeupdate', handleTime);
            video.removeEventListener('loadedmetadata', handleMeta);
            video.removeEventListener('ended', handleEnd);
        };
    }, []);

    const formatTime = (t) => {
        const m = Math.floor(t / 60);
        const s = Math.floor(t % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
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

    const handleSeek = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        videoRef.current.currentTime = percent * duration;
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <Card className="overflow-hidden">
            <div className="relative bg-black">
                <video
                    ref={videoRef}
                    src={src}
                    className="w-full aspect-video"
                    onClick={togglePlay}
                />

                {/* Play overlay */}
                {!isPlaying && (
                    <button
                        onClick={togglePlay}
                        className="absolute inset-0 flex items-center justify-center bg-black/20"
                    >
                        <div className="w-16 h-16 rounded-full bg-[#6366F1] flex items-center justify-center hover:bg-[#818CF8] transition-colors">
                            <Play className="w-7 h-7 text-white ml-1" />
                        </div>
                    </button>
                )}

                {/* Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    {/* Progress */}
                    <div
                        onClick={handleSeek}
                        className="w-full h-1.5 bg-white/20 rounded-full mb-3 cursor-pointer"
                    >
                        <div
                            className="h-full bg-[#6366F1] rounded-full"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" onClick={togglePlay} className="text-white">
                                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setIsMuted(!isMuted)} className="text-white">
                                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </Button>
                            <span className="text-sm text-white/80 font-mono">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => videoRef.current?.requestFullscreen()} className="text-white">
                                <Maximize className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Download Button */}
            <div className="p-4 border-t border-[#1F2433]">
                <Button
                    variant="success"
                    className="w-full"
                    onClick={() => window.open(`http://localhost:8000/download/${jobId}`, '_blank')}
                >
                    <Download className="w-4 h-4 mr-2" />
                    Download Processed Video
                </Button>
            </div>
        </Card>
    );
}

/**
 * Processing Time Comparison Bar
 */
function TimeComparisonBar({ sequentialTime, parallelTime }) {
    const total = sequentialTime + parallelTime;
    const seqPercent = (sequentialTime / total) * 100;
    const parPercent = (parallelTime / total) * 100;
    const speedup = sequentialTime / parallelTime;

    const seqAnimated = useCountUp(sequentialTime, 1.5);
    const parAnimated = useCountUp(parallelTime, 1.5);
    const speedupAnimated = useCountUp(speedup, 1.5);

    return (
        <Card>
            <CardContent className="p-6">
                <h3 className="font-semibold text-[#E5E7EB] mb-6">Processing Time Comparison</h3>

                {/* Visual Bar */}
                <div className="flex h-12 rounded-xl overflow-hidden mb-6">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${seqPercent}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="bg-[#EF4444]/20 border-r border-[#1F2433] flex items-center justify-center"
                    >
                        <span className="text-xs font-medium text-[#F87171]">Sequential</span>
                    </motion.div>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${parPercent}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                        className="bg-[#10B981]/20 flex items-center justify-center"
                    >
                        <span className="text-xs font-medium text-[#34D399]">Parallel</span>
                    </motion.div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 rounded-lg bg-[#0B0E14]">
                        <p className="text-2xl font-bold text-[#F87171] font-mono">
                            {seqAnimated.toFixed(1)}s
                        </p>
                        <p className="text-xs text-[#6B7280] mt-1">Sequential</p>
                    </div>
                    <div className="p-4 rounded-lg bg-[#0B0E14]">
                        <p className="text-2xl font-bold text-[#34D399] font-mono">
                            {parAnimated.toFixed(1)}s
                        </p>
                        <p className="text-xs text-[#6B7280] mt-1">Parallel</p>
                    </div>
                    <div className="p-4 rounded-lg bg-[#0B0E14]">
                        <p className="text-2xl font-bold text-[#6366F1] font-mono">
                            {speedupAnimated.toFixed(1)}x
                        </p>
                        <p className="text-xs text-[#6B7280] mt-1">Speedup</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * Analytics Cards
 */
function AnalyticsCards({ analytics }) {
    if (!analytics) return null;

    const stats = [
        { icon: Clock, label: 'Duration', value: `${analytics.duration}s` },
        { icon: Image, label: 'Resolution', value: `${analytics.width}×${analytics.height}` },
        { icon: Film, label: 'FPS', value: analytics.fps },
        { icon: HardDrive, label: 'Size', value: `${analytics.file_size_mb} MB` },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map(({ icon: Icon, label, value }) => (
                <Card key={label}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#6366F1]/10 flex items-center justify-center">
                                <Icon className="w-5 h-5 text-[#6366F1]" />
                            </div>
                            <div>
                                <p className="text-xs text-[#6B7280]">{label}</p>
                                <p className="font-semibold text-[#E5E7EB]">{value}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

/**
 * Results Page
 */
export function ResultsPage({ jobId, results, analytics }) {
    if (!jobId || !results) {
        return (
            <div className="min-h-screen pt-28 pb-16">
                <div className="container-app">
                    <div className="max-w-2xl mx-auto text-center py-16">
                        <h2 className="heading-3 text-[#E5E7EB] mb-4">No results yet</h2>
                        <p className="text-[#9CA3AF] mb-8">Process a video first to see results</p>
                        <Button asChild>
                            <Link to="/upload">Go to Upload</Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-28 pb-16 relative">
            {/* LightRays Background */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <LightRays
                    raysOrigin="top-center"
                    raysColor="#818CF8"
                    raysSpeed={1.5}
                    lightSpread={0.8}
                    rayLength={6}
                    followMouse={true}
                    mouseInfluence={0.2}
                    noiseAmount={0}
                    distortion={0}
                    className="custom-rays"
                    pulsating={true}
                    fadeDistance={1}
                    saturation={1}
                />
            </div>

            <div className="container-app relative z-10">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between mb-8"
                    >
                        <div>
                            <Badge variant="success" className="mb-2">Complete</Badge>
                            <h1 className="heading-2 text-[#E5E7EB]">Processing Results</h1>
                        </div>
                        <Button variant="secondary" asChild>
                            <Link to="/upload">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Process Another
                            </Link>
                        </Button>
                    </motion.div>

                    <div className="space-y-6">
                        {/* Video Player */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <VideoPlayer src={`http://localhost:8000/download/${jobId}`} jobId={jobId} />
                        </motion.div>

                        {/* Analytics */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <AnalyticsCards analytics={analytics} />
                        </motion.div>

                        {/* Time Comparison */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <TimeComparisonBar
                                sequentialTime={results.sequential_time}
                                parallelTime={results.parallel_time}
                            />
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
