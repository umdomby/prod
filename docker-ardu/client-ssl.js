// client-ssl.js
const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, './letsencrypt/live/ardu.site/privkey.pem')),
    cert: fs.readFileSync(path.join(__dirname, './letsencrypt/live/ardu.site/fullchain.pem')),
};

app.prepare().then(() => {
    createServer(httpsOptions, (req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    }).listen(443, err => {
        if (err) throw err;
        console.log('> Ready on https://ardu.site');
    });
});
   