import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ShinyText from './ShinyText';

const Preloader = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timer);
                    setTimeout(onComplete, 500); // Wait a bit before unmounting
                    return 100;
                }
                // Random increment for realistic feel
                const increment = Math.random() * 15 + 5;
                return Math.min(prev + increment, 100);
            });
        }, 150);

        return () => clearInterval(timer);
    }, [onComplete]);

    return (
        <motion.div
            className="fixed inset-0 z-[100] bg-[#0B0E14] flex flex-col items-center justify-center p-4"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -50, transition: { duration: 0.8, ease: "easeInOut" } }}
        >
            {/* Logo Container */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex items-center gap-4 mb-8"
            >
                <div className="w-16 h-16 rounded-2xl bg-[#6366F1] flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.6)]">
                    <span className="text-white font-bold text-3xl">R</span>
                </div>
                <div className="flex items-center">
                    <ShinyText
                        text="Render"
                        disabled={false}
                        speed={3}
                        className="font-bold text-4xl tracking-tight"
                        color="#E5E7EB"
                        shineColor="#ffffff"
                    />
                    <ShinyText
                        text="X"
                        disabled={false}
                        speed={3}
                        className="font-bold text-4xl tracking-tight ml-1"
                        color="#6366F1"
                        shineColor="#a5b4fc"
                    />
                </div>
            </motion.div>

            {/* Loading Bar Container */}
            <div className="w-64 h-1.5 bg-[#1F2433] rounded-full overflow-hidden relative">
                <motion.div
                    className="h-full bg-[#6366F1] shadow-[0_0_10px_rgba(99,102,241,0.8)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "linear" }}
                />
            </div>

            {/* Percentage Text */}
            <motion.p
                className="text-[#6B7280] text-sm mt-4 font-mono"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                INITIALIZING SYSTEM... {Math.round(progress)}%
            </motion.p>
        </motion.div>
    );
};

export default Preloader;
