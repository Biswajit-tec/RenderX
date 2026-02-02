import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap, TrendingUp, Cpu } from 'lucide-react';
import { Card, CardContent } from './ui/Card';

/**
 * Animated counter hook
 */
function useCountUp(end, duration = 1.5) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime;
        let animationFrame;

        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);

            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            setCount(easeOutQuart * end);

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [end, duration]);

    return count;
}

/**
 * Individual Stat Card component
 */
function StatCard({ icon: Icon, label, value, unit, gradient, delay = 0 }) {
    const animatedValue = useCountUp(parseFloat(value), 2);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
        >
            <Card className="relative overflow-hidden group hover:border-white/20 transition-colors">
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <CardContent className="relative z-10 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient}`}>
                            <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
                    </div>

                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-white">
                            {animatedValue.toFixed(value.includes('.') ? 2 : 0)}
                        </span>
                        <span className="text-xl text-gray-400">{unit}</span>
                    </div>
                </CardContent>

                {/* Glow effect */}
                <motion.div
                    animate={{
                        opacity: [0, 0.5, 0],
                        scale: [0.8, 1.2, 0.8]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${gradient} blur-3xl`}
                />
            </Card>
        </motion.div>
    );
}

/**
 * Results Cards component with animated counters
 */
export function ResultsCards({ results }) {
    if (!results) return null;

    const stats = [
        {
            icon: Clock,
            label: 'Sequential Time',
            value: results.sequentialTime.toString(),
            unit: 's',
            gradient: 'from-orange-500/20 to-red-500/20',
        },
        {
            icon: Zap,
            label: 'Parallel Time',
            value: results.parallelTime.toString(),
            unit: 's',
            gradient: 'from-green-500/20 to-emerald-500/20',
        },
        {
            icon: TrendingUp,
            label: 'Speedup Factor',
            value: results.speedup.toString(),
            unit: 'x',
            gradient: 'from-purple-500/20 to-pink-500/20',
        },
        {
            icon: Cpu,
            label: 'CPU Cores Used',
            value: results.cpuCoresUsed.toString(),
            unit: '',
            gradient: 'from-blue-500/20 to-cyan-500/20',
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-8"
            id="results"
        >
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-white mb-6 flex items-center gap-3"
            >
                <div className="p-2 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                Processing Results
            </motion.h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <StatCard key={stat.label} {...stat} delay={index * 0.1} />
                ))}
            </div>
        </motion.div>
    );
}
