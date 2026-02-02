// RenderX Design System Colors
export const colors = {
    bg: {
        primary: '#0B0E14',
        surface: '#141824',
        elevated: '#1A1F2E',
    },
    border: {
        default: '#1F2433',
        subtle: '#161B27',
        focus: '#6366F1',
    },
    accent: {
        primary: '#6366F1',
        primaryHover: '#818CF8',
        secondary: '#22D3EE',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
    },
    text: {
        primary: '#E5E7EB',
        secondary: '#9CA3AF',
        muted: '#6B7280',
        inverse: '#0B0E14',
    },
};

// Filter options
export const FILTERS = [
    { value: 'grayscale', label: 'Grayscale', description: 'Convert to black and white' },
    { value: 'blur', label: 'Blur', description: 'Apply gaussian blur effect' },
    { value: 'sepia', label: 'Sepia', description: 'Vintage sepia tone filter' },
    { value: 'brightness', label: 'Brightness +20%', description: 'Increase brightness levels' },
    { value: 'contrast', label: 'Contrast +30%', description: 'Enhance color contrast' },
    { value: 'saturation', label: 'Saturation +25%', description: 'Boost color vibrancy' },
    { value: 'warm_tone', label: 'Warm Tone', description: 'Add warm color temperature' },
    { value: 'cool_tone', label: 'Cool Tone', description: 'Add cool color temperature' },
    { value: 'edge_detection', label: 'Edge Detection', description: 'Detect and highlight edges' },
];

// Processing steps
export const PROCESSING_STEPS = [
    { id: 1, label: 'Upload', description: 'Video uploaded' },
    { id: 2, label: 'Split', description: 'Dividing into chunks' },
    { id: 3, label: 'Process', description: 'Applying filter' },
    { id: 4, label: 'Merge', description: 'Combining segments' },
    { id: 5, label: 'Complete', description: 'Ready for download' },
];

// Playback speeds
export const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

// Features for home page
export const FEATURES = [
    {
        title: 'Parallel CPU Rendering',
        description: 'Leverage all CPU cores for maximum processing speed',
        icon: 'Cpu',
    },
    {
        title: 'Multiple Filters',
        description: '9 professional video filters to choose from',
        icon: 'Palette',
    },
    {
        title: 'Benchmark Comparison',
        description: 'See real speedup metrics vs sequential processing',
        icon: 'BarChart3',
    },
    {
        title: 'Local Processing',
        description: 'Your videos never leave your machine',
        icon: 'Shield',
    },
];

// How it works steps
export const HOW_IT_WORKS = [
    {
        step: 1,
        title: 'Upload Video',
        description: 'Drop your MP4 file into the upload zone',
    },
    {
        step: 2,
        title: 'Split Into Chunks',
        description: 'Video is divided into segments for parallel processing',
    },
    {
        step: 3,
        title: 'Parallel Render & Merge',
        description: 'All CPU cores process simultaneously, then merge results',
    },
];
