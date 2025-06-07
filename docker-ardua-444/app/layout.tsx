// file: app/layout.tsx
'use server';
import { Nunito } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { ServoProvider } from '@/components/ServoContext'; // Импортируем ServoProvider
import Head from 'next/head';

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
    return (
        <html lang="en">
        <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        </Head>
        <body className={nunito.className} suppressHydrationWarning={true}>
        <Providers>
            <ServoProvider> {/* Добавляем ServoProvider */}
                <main>{children}</main>
            </ServoProvider>
        </Providers>
        </body>
        </html>
    );
}