'use server'
import { Nunito } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { prisma } from '@/prisma/prisma-client';
import { getUserSession } from '@/components/lib/get-user-session'; // Import your session function

const nunito = Nunito({
    subsets: ['cyrillic'],
    variable: '--font-nunito',
    weight: ['400', '500', '600', '700', '800', '900'],
});

export default async function RootLayout({
                                             children,
                                         }: Readonly<{
    children: React.ReactNode;
}>) {
    const heroesControl = await prisma.heroesControl.findUnique({
        where: { id: 1 },
    });

    const session = await getUserSession(); // Fetch the user session
    const isAdmin = session?.role === 'ADMIN'; // Check if the user is an admin

    const isAdminControlPage = typeof window !== 'undefined' && window.location.pathname === '/admin-control';

    return (
        <html lang="en">
        <head>
            {/*<link data-rh="true" rel="icon" href="/logo.webp" />*/}
        </head>
        <body className={nunito.className}>
        {heroesControl?.globalStop && !isAdmin && !isAdminControlPage ? (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <h1 className="text-3xl font-bold text-red-500">
                    Сайт на обслуживании. Пожалуйста, зайдите позже.
                </h1>
            </div>
        ) : (
            <Providers>
                <main>{children}</main>
            </Providers>
        )}
        </body>
        </html>
    );
}