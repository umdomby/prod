import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'HEROES 3',
};



export default async function HomeLayout({ children }: { children: React.ReactNode }) {

    return (
        <main className="min-h-screen">
            {children}
        </main>
    );
}