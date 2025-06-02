import { Header } from '@/components/header';
import type { Metadata } from 'next';
import React, { Suspense } from 'react';

export const metadata: Metadata = {
    title: 'ARduA',
};

export const dynamic = 'force-dynamic'; // Отключаем SSG


export default function HomeLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="min-h-screen">
            <Suspense>
                <Header />
            </Suspense>
            {children}
        </main>
    );
}