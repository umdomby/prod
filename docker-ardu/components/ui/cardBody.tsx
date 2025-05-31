import React from 'react';

interface CardBodyProps {
    children: React.ReactNode;
    className?: string;
}

export const CardBody: React.FC<CardBodyProps> = ({ children, className }) => {
    return (
        <div className={`mb-4 ${className}`}>
            {children}
        </div>
    );
};