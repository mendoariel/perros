import 'zone.js/node';

import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import * as express from 'express';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import bootstrap from './src/main.server';

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const distFolder = join(process.cwd(), 'dist/frontend/browser');
  const indexHtml = existsSync(join(distFolder, 'index.original.html'))
    ? join(distFolder, 'index.original.html')
    : join(distFolder, 'index.html');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', distFolder);

  // Proxy API requests to backend
  server.use('/api', (req, res, next) => {
    const http = require('http');
    const url = require('url');
    
    const parsedUrl = url.parse(req.url);
    
    // Configuración del backend según el entorno
    const backendHost = process.env['BACKEND_HOST'] || 'peludosclickbackend';
    const backendPort = process.env['BACKEND_PORT'] || '3335';
    
    const options = {
      hostname: backendHost,
      port: backendPort,
      path: `/api${parsedUrl.path}`,
      method: req.method,
      headers: {
        ...req.headers,
        host: `${backendHost}:${backendPort}`
      }
    };

    const proxyReq = http.request(options, (proxyRes: any) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err: any) => {
      console.error('Proxy error:', err);
      res.status(500).send('Proxy error');
    });

    // Handle POST requests with body
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      // For file uploads, pipe the request directly
      req.pipe(proxyReq, { end: true });
    } else {
      req.pipe(proxyReq, { end: true });
    }
  });

  // Proxy static files from backend
  server.use('/pets/files', (req, res, next) => {
    const http = require('http');
    const url = require('url');
    
    const parsedUrl = url.parse(req.url);
    
    // Configuración del backend según el entorno
    const backendHost = process.env['BACKEND_HOST'] || 'peludosclickbackend';
    const backendPort = process.env['BACKEND_PORT'] || '3335';
    
    const options = {
      hostname: backendHost,
      port: backendPort,
      path: `/pets/files${parsedUrl.path}`,
      method: req.method,
      headers: {
        ...req.headers,
        host: `${backendHost}:${backendPort}`
      }
    };

    const proxyReq = http.request(options, (proxyRes: any) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err: any) => {
      console.error('Static files proxy error:', err);
      res.status(404).send('File not found');
    });

    req.pipe(proxyReq, { end: true });
  });

  // Proxy images from backend
  server.use('/images/partners', (req, res, next) => {
    const http = require('http');
    const url = require('url');
    
    const parsedUrl = url.parse(req.url);
    
    // Configuración del backend según el entorno
    const backendHost = process.env['BACKEND_HOST'] || 'peludosclickbackend';
    const backendPort = process.env['BACKEND_PORT'] || '3335';
    
    const options = {
      hostname: backendHost,
      port: backendPort,
      path: `/images/partners${parsedUrl.path}`,
      method: req.method,
      headers: {
        ...req.headers,
        host: `${backendHost}:${backendPort}`
      }
    };

    const proxyReq = http.request(options, (proxyRes: any) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err: any) => {
      console.error('Images proxy error:', err);
      res.status(404).send('Image not found');
    });

    req.pipe(proxyReq, { end: true });
  });

  // Serve static files from /browser
  server.get('*.*', express.static(distFolder, {
    maxAge: '1y'
  }));

  // All regular routes use the Angular engine
  server.get('*', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: distFolder,
        providers: [
          { provide: APP_BASE_HREF, useValue: baseUrl },
          { provide: 'NODE_ENV', useValue: 'production' }
        ],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}

function run(): void {
  const port = parseInt(process.env['PORT'] || '4100', 10);

  // Start up the Node server
  const server = app();
  server.listen(port, '0.0.0.0', () => {
    console.log(`Node Express server listening on http://0.0.0.0:${port}`);
  });
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = mainModule && mainModule.filename || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}

export default bootstrap;
