/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                source: '/favicon.ico',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },
    async rewrites() {
        return [
            {
                source: '/:path*',
                has: [{ type: 'query', key: 'roomId' }],
                destination: '/no-reg?:query*',
            },
        ];
    },
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
                port: '',
            },
        ]
    },
    // Конфигурация для standalone-режима
    output: 'standalone',
    experimental: {
        serverActions: {
            bodySizeLimit: '5mb',
            serverActions: true,
            allowedOrigins: ['localhost:3000/', 'localhost:3001/','https://ardua.site/', 'ardua.site', 'https://ardua.site:444/' ],
        },
    },
    eslint: {
        ignoreDuringBuilds: true, // Добавьте эту строку
    },
};

export default nextConfig;
