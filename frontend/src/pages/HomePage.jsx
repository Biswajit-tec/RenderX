import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Cpu, Palette, BarChart3, Shield, ArrowDown, Zap, Play } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { FEATURES, HOW_IT_WORKS } from '../lib/constants';
import GlassSurface from '../components/GlassSurface';
import Galaxy from '../components/Galaxy';
import GradualBlur from '../components/GradualBlur';
import ShinyText from '../components/ShinyText';
import ElectricBorder from '../components/ElectricBorder';

// Icon mapping
const IconMap = { Cpu, Palette, BarChart3, Shield };

/**
 * Hero Section
 */
function HeroSection() {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 overflow-hidden">


            {/* Subtle background gradient overlay */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-[#6366F1]/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-[#22D3EE]/10 rounded-full blur-[100px]" />
            </div>

            <div className="container-app relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Badge variant="default" className="mb-6">
                            <Zap className="w-3 h-3 mr-1" />
                            Open Source Video Processing
                        </Badge>
                    </motion.div>

                    {/* Main Heading */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="heading-1 text-[#E5E7EB] mb-6"
                    >
                        Render Videos Faster with{' '}
                        <div className="inline-block">
                            <ShinyText
                                text="Parallel Processing"
                                disabled={false}
                                speed={3}
                                className="text-[#6366F1]"
                                color="#6366F1"
                                shineColor="#a5b4fc"
                            />
                        </div>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg md:text-xl text-[#9CA3AF] max-w-2xl mx-auto mb-10"
                    >
                        Split your video into chunks, process them in parallel across all CPU cores,
                        and see real performance gains compared to sequential processing.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
                    >
                        <Button size="xl" asChild>
                            <Link to="/upload" className="flex items-center gap-2">
                                <span>Start Rendering</span>
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </Button>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="flex justify-center"
                    >
                        <GlassSurface
                            className="flex items-center justify-around w-full max-w-2xl px-8 py-6"
                            borderRadius={24}
                            blur={20}
                            opacity={0.6}
                        >
                            <div className="text-center">
                                <p className="text-3xl font-bold text-[#6366F1]">4x</p>
                                <p className="text-xs text-[#9CA3AF]">Faster Processing</p>
                            </div>
                            <div className="w-px h-12 bg-[#1F2433]" />
                            <div className="text-center">
                                <p className="text-3xl font-bold text-[#22D3EE]">9+</p>
                                <p className="text-xs text-[#9CA3AF]">Video Filters</p>
                            </div>
                            <div className="w-px h-12 bg-[#1F2433]" />
                            <div className="text-center">
                                <p className="text-3xl font-bold text-[#10B981]">100%</p>
                                <p className="text-xs text-[#9CA3AF]">Local Processing</p>
                            </div>
                        </GlassSurface>
                    </motion.div>

                    {/* Scroll indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="mt-16"
                    >
                        <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <ArrowDown className="w-5 h-5 text-[#6B7280] mx-auto" />
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

/**
 * How It Works Section
 */
function HowItWorksSection() {
    return (
        <section className="py-16 md:py-24">
            <div className="container-app">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="heading-2 text-[#E5E7EB] mb-4">How It Works</h2>
                    <p className="text-[#9CA3AF] max-w-xl mx-auto">
                        Three simple steps to faster video processing
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    {HOW_IT_WORKS.map((item, index) => (
                        <motion.div
                            key={item.step}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="relative"
                        >
                            {index < HOW_IT_WORKS.length - 1 && (
                                <div className="hidden md:block absolute top-8 left-full w-full h-[2px] bg-gradient-to-r from-[#1F2433] to-transparent" />
                            )}

                            <div className="text-center">
                                <div className="w-16 h-16 rounded-2xl bg-[#141824] border border-[#1F2433] flex items-center justify-center mx-auto mb-6">
                                    <span className="text-2xl font-bold text-[#6366F1]">{item.step}</span>
                                </div>
                                <h3 className="text-lg font-semibold text-[#E5E7EB] mb-2">{item.title}</h3>
                                <p className="text-sm text-[#9CA3AF]">{item.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/**
 * Features Grid Section
 */
function FeaturesSection() {
    return (
        <section className="py-16 md:py-24">
            <div className="container-app">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="heading-2 text-[#E5E7EB] mb-4">Features</h2>
                    <p className="text-[#9CA3AF] max-w-xl mx-auto">
                        Built for performance and transparency
                    </p>
                </motion.div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {FEATURES.map((feature, index) => {
                        const Icon = IconMap[feature.icon] || Cpu;
                        return (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <ElectricBorder
                                    color="#6366F1"
                                    speed={1}
                                    chaos={0.12}
                                    thickness={2}
                                    borderRadius={16}
                                >
                                    <div className="bg-[#141824] p-6 h-full rounded-2xl relative z-10">
                                        <div className="w-12 h-12 rounded-xl bg-[#6366F1]/10 flex items-center justify-center mb-4 group-hover:bg-[#6366F1]/20 transition-colors">
                                            <Icon className="w-6 h-6 text-[#6366F1]" />
                                        </div>
                                        <h3 className="font-semibold text-[#E5E7EB] mb-2">{feature.title}</h3>
                                        <p className="text-sm text-[#9CA3AF]">{feature.description}</p>
                                    </div>
                                </ElectricBorder>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

/**
 * Architecture Diagram Section
 */
function ArchitectureSection() {
    const components = [
        { label: 'Frontend', sublabel: 'React + Vite', color: '#6366F1' },
        { label: 'FastAPI', sublabel: 'REST API', color: '#22D3EE' },
        { label: 'Workers', sublabel: 'Multiprocessing', color: '#10B981' },
    ];

    return (
        <section className="py-16 md:py-24">
            <div className="container-app">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="heading-2 text-[#E5E7EB] mb-4">Architecture</h2>
                    <p className="text-[#9CA3AF] max-w-xl mx-auto">
                        Simple, efficient, local processing pipeline
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 max-w-3xl mx-auto"
                >
                    {components.map((comp, index) => (
                        <React.Fragment key={comp.label}>
                            <div className="w-full md:w-auto">
                                <Card className="p-6 text-center min-w-[180px]">
                                    <p className="font-semibold" style={{ color: comp.color }}>{comp.label}</p>
                                    <p className="text-xs text-[#6B7280] mt-1">{comp.sublabel}</p>
                                </Card>
                            </div>
                            {index < components.length - 1 && (
                                <div className="text-[#6B7280] rotate-90 md:rotate-0">
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

/**
 * Home Page
 */
export function HomePage() {
    return (
        <div className="relative isolate min-h-screen">
            {/* Global Background Galaxy */}
            <div className="fixed inset-0 z-[-1] pointer-events-none opacity-40">
                <Galaxy
                    density={0.5}
                    starSpeed={0.2}
                    baseColor="#0B0E14"
                    mouseInteraction={true}
                    mouseRepulsion={false}
                    rotationSpeed={0.05}
                />
            </div>

            {/* Global Gradual Blur */}
            <GradualBlur
                target="page"
                position="bottom"
                height="6rem"
                strength={1}
                divCount={8}
                curve="ease-out"
                opacity={0.7}
                zIndex={0}
            />

            <div className="relative z-10">
                <HeroSection />
                <HowItWorksSection />
                <FeaturesSection />
                <ArchitectureSection />
            </div>
        </div>
    );
}
