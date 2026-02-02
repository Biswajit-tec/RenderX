import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Scissors, Cpu, Combine, CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import { PROCESSING_STEPS } from '../lib/constants';

// Icon mapping for steps
const StepIconMap = {
    Upload, Scissors, Cpu, Combine, CheckCircle
};

/**
 * Processing State component with stepper visualization
 */
export function ProcessingState({ currentStep = 3, filterName }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="py-12"
        >
            <Card className="relative overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-purple-600/10 animate-gradient" />

                <CardContent className="relative z-10 py-10">
                    {/* Main spinner */}
                    <div className="flex flex-col items-center mb-10">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-500 mb-4"
                        />
                        <h3 className="text-2xl font-bold text-white mb-2">Processing Video</h3>
                        <p className="text-gray-400">Applying {filterName} filter using parallel processing</p>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center justify-center gap-2 md:gap-4 flex-wrap">
                        {PROCESSING_STEPS.map((step, index) => {
                            const Icon = StepIconMap[step.icon] || Cpu;
                            const isActive = index + 1 === currentStep;
                            const isCompleted = index + 1 < currentStep;

                            return (
                                <React.Fragment key={step.id}>
                                    {/* Step */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex flex-col items-center"
                                    >
                                        <motion.div
                                            animate={isActive ? {
                                                boxShadow: ['0 0 0 0 rgba(168, 85, 247, 0.4)', '0 0 0 20px rgba(168, 85, 247, 0)'],
                                            } : {}}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isCompleted
                                                    ? 'bg-green-500/20 border-2 border-green-500'
                                                    : isActive
                                                        ? 'bg-purple-500/20 border-2 border-purple-500'
                                                        : 'bg-white/5 border-2 border-white/10'
                                                }`}
                                        >
                                            {isActive ? (
                                                <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                                            ) : isCompleted ? (
                                                <CheckCircle className="w-5 h-5 text-green-400" />
                                            ) : (
                                                <Icon className="w-5 h-5 text-gray-500" />
                                            )}
                                        </motion.div>
                                        <span className={`text-xs mt-2 ${isActive ? 'text-purple-400' : isCompleted ? 'text-green-400' : 'text-gray-500'
                                            }`}>
                                            {step.label}
                                        </span>
                                    </motion.div>

                                    {/* Connector */}
                                    {index < PROCESSING_STEPS.length - 1 && (
                                        <div className="hidden md:block w-12 h-0.5 bg-white/10 relative">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: isCompleted ? '100%' : '0%' }}
                                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-purple-500"
                                            />
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>

                    {/* Progress message */}
                    <motion.p
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-center text-gray-500 mt-8 text-sm"
                    >
                        Please wait while we process your video with all available CPU cores...
                    </motion.p>
                </CardContent>
            </Card>
        </motion.div>
    );
}
