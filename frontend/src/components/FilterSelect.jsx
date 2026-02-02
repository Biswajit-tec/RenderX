import React from 'react';
import { motion } from 'framer-motion';
import {
    Palette, Droplets, ImageOff, Sun, Contrast,
    Sparkles, Flame, Snowflake, Scan, ChevronDown
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { FILTERS } from '../lib/constants';

// Icon mapping
const IconMap = {
    Palette, Droplets, ImageOff, Sun, Contrast,
    Sparkles, Flame, Snowflake, Scan
};

/**
 * Filter Selection component with dropdown style
 */
export function FilterSelect({ selectedFilter, onFilterChange, onProcess, disabled }) {
    const [isOpen, setIsOpen] = React.useState(false);
    const currentFilter = FILTERS.find(f => f.value === selectedFilter);
    const FilterIcon = IconMap[currentFilter?.icon] || Palette;

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
        >
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-pink-500/20">
                            <Sparkles className="w-5 h-5 text-pink-400" />
                        </div>
                        <div>
                            <CardTitle>Select Filter</CardTitle>
                            <CardDescription>Choose a visual effect to apply to your video</CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Custom Select Dropdown */}
                    <div className="relative">
                        <motion.button
                            onClick={() => setIsOpen(!isOpen)}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-purple-500/20">
                                    <FilterIcon className="w-5 h-5 text-purple-400" />
                                </div>
                                <div className="text-left">
                                    <p className="font-medium text-white">{currentFilter?.label}</p>
                                    <p className="text-sm text-gray-500">{currentFilter?.description}</p>
                                </div>
                            </div>
                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </motion.button>

                        {/* Dropdown Menu */}
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-full left-0 right-0 mt-2 py-2 rounded-xl bg-gray-900/95 backdrop-blur-xl border border-white/10 shadow-xl z-50 max-h-80 overflow-y-auto"
                            >
                                {FILTERS.map((filter) => {
                                    const Icon = IconMap[filter.icon] || Palette;
                                    return (
                                        <motion.button
                                            key={filter.value}
                                            onClick={() => {
                                                onFilterChange(filter.value);
                                                setIsOpen(false);
                                            }}
                                            whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                                            className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${selectedFilter === filter.value ? 'bg-purple-500/20' : ''
                                                }`}
                                        >
                                            <div className={`p-2 rounded-lg ${selectedFilter === filter.value ? 'bg-purple-500/30' : 'bg-white/5'
                                                }`}>
                                                <Icon className={`w-4 h-4 ${selectedFilter === filter.value ? 'text-purple-400' : 'text-gray-400'
                                                    }`} />
                                            </div>
                                            <div className="text-left">
                                                <p className={`font-medium ${selectedFilter === filter.value ? 'text-white' : 'text-gray-300'
                                                    }`}>{filter.label}</p>
                                                <p className="text-xs text-gray-500">{filter.description}</p>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </motion.div>
                        )}
                    </div>

                    {/* Process Button */}
                    <Button
                        onClick={onProcess}
                        disabled={disabled}
                        className="w-full"
                        size="lg"
                    >
                        <Sparkles className="w-5 h-5 mr-2" />
                        Start Processing
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );
}
