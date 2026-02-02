import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Upload, FileVideo, X, ChevronDown, Loader2 } from 'lucide-react';
import axios from 'axios';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { FILTERS } from '../lib/constants';
import { useToast } from '../components/Toast';
import Ballpit from '../components/Ballpit';

/**
 * Filter Select Component
 */
function FilterSelect({ value, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const selected = FILTERS.find(f => f.value === value);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-[#0B0E14] border border-[#1F2433] hover:border-[#2D3344] transition-colors text-left"
            >
                <div>
                    <p className="font-medium text-[#E5E7EB]">{selected?.label}</p>
                    <p className="text-sm text-[#6B7280] mt-0.5">{selected?.description}</p>
                </div>
                <ChevronDown className={`w-5 h-5 text-[#6B7280] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 right-0 mt-2 p-2 rounded-xl bg-[#141824] border border-[#1F2433] shadow-xl z-50 max-h-64 overflow-y-auto"
                >
                    {FILTERS.map((filter) => (
                        <button
                            key={filter.value}
                            onClick={() => {
                                onChange(filter.value);
                                setIsOpen(false);
                            }}
                            className={`w-full p-3 rounded-lg text-left transition-colors ${value === filter.value
                                ? 'bg-[#6366F1]/10 text-[#E5E7EB]'
                                : 'hover:bg-[#1A1F2E] text-[#9CA3AF]'
                                }`}
                        >
                            <p className="font-medium">{filter.label}</p>
                            <p className="text-xs text-[#6B7280] mt-0.5">{filter.description}</p>
                        </button>
                    ))}
                </motion.div>
            )}
        </div>
    );
}

/**
 * Upload Page
 */
export function UploadPage({ onJobCreated, onAnalytics }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [filterType, setFilterType] = useState('grayscale');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [processing, setProcessing] = useState(false);
    const [jobId, setJobId] = useState(null);
    const [analytics, setAnalytics] = useState(null);

    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleFileSelect = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('video/mp4')) {
            toast({ type: 'error', title: 'Invalid file type', message: 'Please select an MP4 video' });
            return;
        }

        if (file.size > 100 * 1024 * 1024) {
            toast({ type: 'error', title: 'File too large', message: 'Maximum file size is 100MB' });
            return;
        }

        setSelectedFile(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect({ target: { files: [file] } });
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await axios.post('http://localhost:8000/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (e) => {
                    setUploadProgress(Math.round((e.loaded * 100) / e.total));
                },
            });

            setJobId(response.data.job_id);
            setAnalytics(response.data.analytics);
            onAnalytics?.(response.data.analytics);
            toast({ type: 'success', title: 'Upload complete', message: 'Ready to process' });
        } catch (error) {
            toast({ type: 'error', title: 'Upload failed', message: error.message });
        } finally {
            setUploading(false);
        }
    };

    const handleProcess = async () => {
        if (!jobId) return;

        setProcessing(true);

        try {
            await axios.post('http://localhost:8000/process', {
                job_id: jobId,
                filter_type: filterType,
            });

            // Poll for completion
            const pollInterval = setInterval(async () => {
                try {
                    const response = await axios.get(`http://localhost:8000/status/${jobId}`);
                    if (response.data.status === 'completed') {
                        clearInterval(pollInterval);
                        onJobCreated?.(jobId, response.data, analytics);
                        navigate('/results');
                    } else if (response.data.status === 'failed') {
                        clearInterval(pollInterval);
                        toast({ type: 'error', title: 'Processing failed', message: response.data.error });
                        setProcessing(false);
                    }
                } catch (error) {
                    clearInterval(pollInterval);
                    toast({ type: 'error', title: 'Error', message: 'Failed to check status' });
                    setProcessing(false);
                }
            }, 2000);
        } catch (error) {
            toast({ type: 'error', title: 'Failed to start processing', message: error.message });
            setProcessing(false);
        }
    };

    return (
        <div className="min-h-screen pt-28 pb-16 relative overflow-hidden">
            {/* Ballpit Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[600px] z-0 opacity-50 pointer-events-none">
                <Ballpit
                    count={50}
                    gravity={0.01}
                    friction={0.9975}
                    wallBounce={0.95}
                    followCursor={true}
                    colors={[0x6366F1, 0x22D3EE, 0x10B981]}
                />
            </div>

            <div className="container-app relative z-10">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <h1 className="heading-2 text-[#E5E7EB] mb-4">Upload Video</h1>
                        <p className="text-[#9CA3AF]">
                            Drop your MP4 file and select a filter to apply
                        </p>
                    </motion.div>

                    {/* Upload Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card>
                            <CardContent className="p-8">
                                {/* Drop Zone */}
                                {!selectedFile ? (
                                    <div
                                        onDrop={handleDrop}
                                        onDragOver={(e) => e.preventDefault()}
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-[#1F2433] rounded-xl p-12 text-center cursor-pointer hover:border-[#6366F1]/50 hover:bg-[#6366F1]/5 transition-all"
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="video/mp4"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                        />
                                        <motion.div
                                            animate={{ y: [0, -5, 0] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="w-16 h-16 rounded-2xl bg-[#1A1F2E] flex items-center justify-center mx-auto mb-6"
                                        >
                                            <Upload className="w-8 h-8 text-[#6366F1]" />
                                        </motion.div>
                                        <p className="text-[#E5E7EB] font-medium mb-2">Drop your video here</p>
                                        <p className="text-sm text-[#6B7280]">MP4 files up to 100MB</p>
                                    </div>
                                ) : (
                                    /* File Preview */
                                    <div className="bg-[#0B0E14] rounded-xl p-6 border border-[#1F2433]">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-[#6366F1]/10 flex items-center justify-center">
                                                <FileVideo className="w-6 h-6 text-[#6366F1]" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-[#E5E7EB] truncate">{selectedFile.name}</p>
                                                <p className="text-sm text-[#6B7280]">
                                                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                                </p>
                                            </div>
                                            {!jobId && !uploading && (
                                                <Button variant="ghost" size="icon" onClick={() => setSelectedFile(null)}>
                                                    <X className="w-5 h-5" />
                                                </Button>
                                            )}
                                            {jobId && <Badge variant="success">Uploaded</Badge>}
                                        </div>

                                        {uploading && (
                                            <div className="mt-4">
                                                <Progress value={uploadProgress} />
                                                <p className="text-xs text-[#6B7280] text-center mt-2">
                                                    Uploading... {uploadProgress}%
                                                </p>
                                            </div>
                                        )}

                                        {!jobId && !uploading && (
                                            <Button onClick={handleUpload} className="w-full mt-4">
                                                Upload Video
                                            </Button>
                                        )}
                                    </div>
                                )}

                                {/* Filter Selection */}
                                {jobId && !processing && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-8"
                                    >
                                        <label className="block text-sm font-medium text-[#9CA3AF] mb-3">
                                            Select Filter
                                        </label>
                                        <FilterSelect value={filterType} onChange={setFilterType} />

                                        <Button onClick={handleProcess} className="w-full mt-6" size="lg">
                                            Start Processing
                                        </Button>
                                    </motion.div>
                                )}

                                {/* Processing State */}
                                {processing && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="mt-8 text-center py-8"
                                    >
                                        <Loader2 className="w-12 h-12 text-[#6366F1] animate-spin mx-auto mb-4" />
                                        <p className="text-[#E5E7EB] font-medium">Processing video...</p>
                                        <p className="text-sm text-[#6B7280] mt-1">
                                            Applying {FILTERS.find(f => f.value === filterType)?.label} filter
                                        </p>
                                    </motion.div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
