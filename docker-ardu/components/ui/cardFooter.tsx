import React from 'react';

interface CardFooterProps {
    children: React.ReactNode;
    className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => {
    return (
        <div className={`border-t pt-2 mt-4 ${className}`}>
            {children}
        </div>
    );
};