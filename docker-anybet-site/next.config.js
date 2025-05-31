// file: docker-webrtc-js/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['anybet.site'],
    },
    async headers() {
        return [
            {
                source: '/(.*)', // применяется ко всем страницам
                headers: [
                    {
                        key: 'Permissions-Policy',
                        // value: 'microphone=("https://anybet.site"), camera=("https://anybet.site")',
                        //или только для своего домена:
                        value: 'microphone=self, camera=self',
                    },
                    {
                        key: 'Access-Control-Allow-Origin',
                        value: 'https://anybet.site',
                    },
                    {
                        key: 'Access-Control-Allow-Methods',
                        value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
                    },
                    {
                        key: 'Access-Control-Allow-Headers',
                        value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
                    },
                ],
            },
            {
                source: '/api/:path*',
                headers: [
                    {
                        key: 'Access-Control-Allow-Origin',
                        value: 'https://anybet.site',
                    },
                ],
            },
        ]
    },
    allowedDevOrigins: [
        'anybet.site',
        'localhost',
    ],
}

module.exports = nextConfig