import React from 'react';

interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => {
    return (
        <div className={`border-b pb-2 mb-4 ${className}`}>
            {children}
        </div>
    );
};