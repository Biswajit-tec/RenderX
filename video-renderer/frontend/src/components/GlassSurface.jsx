import React from 'react';

/**
 * GlassSurface - A simple CSS-based glassmorphism component
 * No SVG filters, works across all browsers
 */
const GlassSurface = ({
    children,
    className = '',
    style = {},
    blur = 16,
    opacity = 0.7,
    borderRadius = 20,
    borderColor = 'rgba(99, 102, 241, 0.2)',
    hoverBorderColor = 'rgba(99, 102, 241, 0.4)',
}) => {
    const containerStyle = {
        ...style,
        borderRadius: `${borderRadius}px`,
        background: `rgba(20, 24, 36, ${opacity})`,
        backdropFilter: `blur(${blur}px) saturate(1.5)`,
        WebkitBackdropFilter: `blur(${blur}px) saturate(1.5)`,
        border: `1px solid ${borderColor}`,
        transition: 'all 0.3s ease',
    };

    return (
        <div
            className={`glass-surface-simple ${className}`}
            style={containerStyle}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = hoverBorderColor;
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = borderColor;
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            {children}
        </div>
    );
};

export default GlassSurface;
