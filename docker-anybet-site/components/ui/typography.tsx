import React from 'react';

interface TypographyProps {
    children: React.ReactNode;
    variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2';
    className?: string;
}

export const Typography: React.FC<TypographyProps> = ({ children, variant = 'body1', className }) => {
    const baseStyle = 'text-gray-800';
    const variantStyles = {
        h1: 'text-2xl font-bold',
        h2: 'text-xl font-bold',
        h3: 'text-lg font-bold',
        h4: 'text-md font-bold',
        h5: 'text-sm font-bold',
        h6: 'text-xs font-bold',
        body1: 'text-base',
        body2: 'text-sm',
    };

    return (
        <div className={`${baseStyle} ${variantStyles[variant]} ${className}`}>
            {children}
        </div>
    );
};
