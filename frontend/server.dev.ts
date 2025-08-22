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

  // Health check endpoint for backend
  server.get('/health/backend', async (req, res) => {
    const http = require('http');
    const options = {
      hostname: 'backend-perros',
      port: 3333,
      path: '/health',
      method: 'GET',
      timeout: 5000
    };

    const healthReq = http.request(options, (healthRes: any) => {
      res.status(200).json({ status: 'ok', backend: 'connected' });
    });

    healthReq.on('error', (err: any) => {
      res.status(503).json({ status: 'error', backend: 'disconnected', error: err.message });
    });

    healthReq.end();
  });

  // Proxy API requests to backend for development
  server.use('/api', (req, res, next) => {
    const http = require('http');
    const url = require('url');
    
    const parsedUrl = url.parse(req.url);
    const options = {
      hostname: 'backend-perros',
      port: 3333,
      path: parsedUrl.path,
      method: req.method,
      headers: {
        ...req.headers,
        host: 'backend-perros:3333'
      },
      timeout: 10000 // 10 second timeout
    };

    const proxyReq = http.request(options, (proxyRes: any) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err: any) => {
      console.error('Proxy error:', err);
      // Return a more specific error response
      res.status(502).json({
        error: 'Bad Gateway',
        message: 'Unable to connect to backend service',
        details: err.message
      });
    });

    proxyReq.on('timeout', () => {
      console.error('Proxy timeout');
      proxyReq.destroy();
      res.status(504).json({
        error: 'Gateway Timeout',
        message: 'Backend service timeout'
      });
    });

    // Handle POST requests with body
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      req.on('end', () => {
        proxyReq.write(body);
        proxyReq.end();
      });
    } else {
      req.pipe(proxyReq, { end: true });
    }
  });

  // Proxy static files from backend for development
  server.use('/pets/files', (req, res, next) => {
    const http = require('http');
    const url = require('url');
    
    const parsedUrl = url.parse(req.url);
    const options = {
      hostname: 'backend-perros', // Use the local Docker service name
      port: 3333,
      path: `/pets/files${parsedUrl.path}`,
      method: req.method,
      headers: {
        ...req.headers,
        host: 'backend-perros:3333'
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

  // Serve static files from /browser with proper MIME types
  server.use(express.static(distFolder, {
    maxAge: '0', // No cache in development
    setHeaders: (res, path) => {
      // Set proper MIME types for JavaScript files
      if (path.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      } else if (path.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      } else if (path.endsWith('.html')) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
      } else if (path.endsWith('.map')) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
      }
    }
  }));

  // Serve JavaScript files directly
  server.get('*.js', (req, res, next) => {
    const filePath = join(distFolder, req.path);
    if (existsSync(filePath)) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.sendFile(filePath);
    } else {
      next();
    }
  });

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
          { provide: 'NODE_ENV', useValue: 'development' }
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
