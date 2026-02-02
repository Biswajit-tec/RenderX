import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Github, FileText } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';

import ShinyText from './ShinyText';
/**
 * RenderX Logo component
 */
function Logo() {
    return (
        <div className="flex items-center gap-3">
            {/* Logo mark - R in rounded square */}
            <div className="w-9 h-9 rounded-lg bg-[#6366F1] flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                <span className="text-white font-bold text-lg">R</span>
            </div>
            <Link to="/" className="no-underline">
                <div className="flex items-center">
                    <ShinyText
                        text="Render"
                        disabled={false}
                        speed={3}
                        className="font-semibold text-lg tracking-tight"
                        color="#E5E7EB"
                        shineColor="#ffffff"
                    />
                    <ShinyText
                        text="X"
                        disabled={false}
                        speed={3}
                        className="font-semibold text-lg tracking-tight ml-px"
                        color="#6366F1"
                        shineColor="#a5b4fc"
                    />
                </div>
            </Link>
        </div>
    );
}

/**
 * Navigation links
 */
const NAV_LINKS = [
    { href: '/', label: 'Home' },
    { href: '/upload', label: 'Upload' },
    { href: '/results', label: 'Results' },
];
/**
 * Navbar component - sticky with glassmorphism
 */
export function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                scrolled ? "py-3" : "py-4"
            )}
        >
            <div className="container-app">
                <div className={cn(
                    "flex items-center justify-between px-6 py-3 rounded-2xl transition-all duration-300",
                    scrolled
                        ? "bg-[#141824]/90 backdrop-blur-xl border border-[#1F2433] shadow-lg shadow-black/20"
                        : "bg-transparent"
                )}>
                    {/* Logo */}
                    <Link to="/">
                        <Logo />
                    </Link>

                    {/* Center Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                to={link.href}
                                className={cn(
                                    "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                                    location.pathname === link.href
                                        ? "text-[#E5E7EB] bg-[#1A1F2E]"
                                        : "text-[#9CA3AF] hover:text-[#E5E7EB] hover:bg-[#1A1F2E]/50"
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        <Button variant="ghost" size="icon" asChild>
                            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                                <Github className="w-5 h-5" />
                            </a>
                        </Button>
                        <Button variant="secondary" size="sm">
                            <FileText className="w-4 h-4 mr-1.5" />
                            Docs
                        </Button>
                    </div>

                </div>
            </div>
        </motion.nav>
    );
}
