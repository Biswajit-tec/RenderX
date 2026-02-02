import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Image, Film, HardDrive, Ratio, Volume2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';

/**
 * Video Analytics display component
 */
export function AnalyticsCard({ analytics }) {
    if (!analytics) return null;

    const stats = [
        { icon: Clock, label: 'Duration', value: `${analytics.duration}s` },
        { icon: Image, label: 'Resolution', value: `${analytics.width}×${analytics.height}` },
        { icon: Film, label: 'Frame Rate', value: `${analytics.fps} FPS` },
        { icon: HardDrive, label: 'File Size', value: `${analytics.file_size_mb} MB` },
        { icon: Ratio, label: 'Aspect Ratio', value: analytics.aspect_ratio },
        { icon: Volume2, label: 'Audio', value: analytics.has_audio ? 'Yes' : 'No' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-blue-500/20">
                                <Film className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Video Analytics</CardTitle>
                                <CardDescription>Technical details of your video</CardDescription>
                            </div>
                        </div>
                        <Badge variant="success">Ready</Badge>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {stats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="p-3 rounded-xl bg-white/5 border border-white/5"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Icon className="w-3 h-3 text-gray-500" />
                                        <span className="text-xs text-gray-500">{stat.label}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-white">{stat.value}</span>
                                </motion.div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
