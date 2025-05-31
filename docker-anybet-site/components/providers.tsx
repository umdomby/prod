'use client';

import React, {ReactNode} from 'react';
import {Toaster} from 'react-hot-toast';
import NextTopLoader from 'nextjs-toploader';


interface ProvidersProps {
    children: ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({children}) => {

    return (
        <>
            <React.StrictMode>
                {children}
            </React.StrictMode>
            <Toaster/>
            <NextTopLoader/>
        </>
    );
};