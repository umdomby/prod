/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true, // Включите для отладки
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
