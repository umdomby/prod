'use client';

import React, {ReactNode, useEffect, useState} from 'react';
import {Toaster} from 'react-hot-toast';
import {SessionProvider} from 'next-auth/react';
import NextTopLoader from 'nextjs-toploader';
import {ThemeProvider} from "next-themes";


interface ProvidersProps {
    children: ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({children}) => {


    const [mounted, setMounted] = useState(false);
    const [theme, setTheme] = useState<string | null>(null); // null по умолчанию

    useEffect(() => {
        setMounted(true); // Компонент смонтирован
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
            setTheme(storedTheme); // Используем сохраненную тему
        }
    }, []);

    if (!mounted) {
        return null; // Не рендерим ThemeProvider до монтирования
    }

    return (
        <>
            <React.StrictMode>
                <SessionProvider>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme={theme || 'system'}  // system - fallback, если нет
                        enableSystem
                        disableTransitionOnChange
                    >
                    {children}
                    </ThemeProvider>
                </SessionProvider>
            </React.StrictMode>
            <Toaster/>
            <NextTopLoader/>
        </>
    );
};