import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileVideo, X, HardDrive } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Progress } from './ui/Progress';
import { Badge } from './ui/Badge';

/**
 * Upload Card with drag-and-drop functionality
 */
export function UploadCard({
    selectedFile,
    onFileSelect,
    onUpload,
    onRemove,
    uploading,
    uploadProgress,
    uploaded
}) {
    const fileInputRef = useRef(null);

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            onFileSelect({ target: { files: [file] } });
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
        >
            <Card className="overflow-hidden">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-purple-500/20">
                            <Upload className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <CardTitle>Upload Video</CardTitle>
                            <CardDescription>Drag and drop or click to select your MP4 file</CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/mp4"
                        onChange={onFileSelect}
                        className="hidden"
                    />

                    {!selectedFile ? (
                        /* Drop Zone */
                        <motion.div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onClick={() => fileInputRef.current?.click()}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className="relative border-2 border-dashed border-white/20 rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 hover:border-purple-500/50 hover:bg-white/5 group"
                        >
                            {/* Animated border */}
                            <div className="absolute inset-0 rounded-2xl overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/20 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity animate-border-flow" />
                            </div>

                            <div className="relative z-10">
                                <motion.div
                                    animate={{ y: [0, -8, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4"
                                >
                                    <FileVideo className="w-8 h-8 text-purple-400" />
                                </motion.div>
                                <p className="text-lg font-medium text-white mb-2">
                                    Drop your video here
                                </p>
                                <p className="text-sm text-gray-500">
                                    MP4 files up to 100MB
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        /* File Preview */
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/5 rounded-2xl p-6 border border-white/10"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-purple-500/20">
                                    <FileVideo className="w-6 h-6 text-purple-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium truncate">
                                        {selectedFile.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <HardDrive className="w-3 h-3 text-gray-500" />
                                        <span className="text-sm text-gray-500">
                                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                        </span>
                                        {uploaded && (
                                            <Badge variant="success" className="ml-2">Uploaded</Badge>
                                        )}
                                    </div>
                                </div>
                                {!uploaded && !uploading && (
                                    <Button variant="ghost" size="icon" onClick={onRemove}>
                                        <X className="w-5 h-5" />
                                    </Button>
                                )}
                            </div>

                            {/* Upload Progress */}
                            {uploading && (
                                <div className="mt-4">
                                    <Progress value={uploadProgress} />
                                    <p className="text-sm text-gray-400 text-center mt-2">
                                        Uploading... {uploadProgress}%
                                    </p>
                                </div>
                            )}

                            {/* Upload Button */}
                            {!uploaded && !uploading && (
                                <Button onClick={onUpload} className="w-full mt-4">
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload Video
                                </Button>
                            )}
                        </motion.div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
