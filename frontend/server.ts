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
      path: `/api/pets/files${parsedUrl.path}`,
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

  // Proxy pet images from backend
  server.use('/api/pets/files', (req, res, next) => {
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
      console.error('Pet images proxy error:', err);
      res.status(404).send('Image not found');
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

  // Function to fetch pet data from API
  async function fetchPetData(medalString: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const http = require('http');
      const backendHost = process.env['BACKEND_HOST'] || 'peludosclickbackend';
      const backendPort = process.env['BACKEND_PORT'] || '3335';
      
      const options = {
        hostname: backendHost,
        port: backendPort,
        path: `/api/qr/pet/${medalString}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const req = http.request(options, (res: any) => {
        let data = '';
        res.on('data', (chunk: any) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const pet = JSON.parse(data);
            resolve(pet);
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', (error: any) => {
        reject(error);
      });

      req.end();
    });
  }

  // Function to update meta tags in HTML
  function updateMetaTags(html: string, pet: any, medalString: string, isPublicPage: boolean = true, userAgent: string = ''): string {
    const metaBaseUrl = 'https://peludosclick.com';
    
    // Construct absolute URLs - always use social images for better compatibility
    const isWhatsApp = userAgent.includes('WhatsApp') || userAgent.includes('whatsapp') || userAgent.includes('WhatsAppWeb');
    // More aggressive cache busting for WhatsApp
    const timestamp = isWhatsApp ? `?v=${Date.now()}&cb=${Math.random().toString(36).substr(2, 9)}` : '';
    
    // Use WhatsApp-specific endpoint with unique URL per pet
    const petImageUrl = pet.image ? 
      `${metaBaseUrl}/pets/files/${pet.image}/whatsapp?pet=${medalString}${timestamp}` : 
      `${metaBaseUrl}/assets/main/cat-dog-free-safe-with-medal-peldudosclick.jpeg${timestamp}`;
    
    const description = pet.description || 'Conoce más sobre esta mascota en PeludosClick';
    const title = `${pet.petName} - PeludosClick`;
    const url = isPublicPage ? 
      `${metaBaseUrl}/mascota-publica/${medalString}` : 
      `${metaBaseUrl}/mascota/${medalString}`;

    // Add meta tags to HTML
    const metaTags = `
    <!-- Primary Meta Tags -->
    <meta name="title" content="${title}">
    <meta name="description" content="${description}">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${petImageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:type" content="image/jpeg">
    <meta property="og:image:alt" content="${title}">
    <meta property="og:url" content="${url}">
    <meta property="og:site_name" content="PeludosClick">
    <meta property="og:locale" content="es_LA">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${petImageUrl}">
    <meta name="twitter:image:alt" content="${title}">
    <meta name="twitter:site" content="@peludosClick">
    
    <!-- WhatsApp specific -->
    <meta property="og:image:secure_url" content="${petImageUrl}">
    <meta name="robots" content="index, follow">
    <meta name="author" content="PeludosClick">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    `;

    // Replace the comment with actual meta tags
    let updatedHtml = html.replace(
      /<!-- Meta tags will be generated dynamically by the server -->/,
      metaTags
    );

    // Update title
    updatedHtml = updatedHtml.replace(
      /<title>[^<]*<\/title>/g,
      `<title>${title}</title>`
    );

    return updatedHtml;
  }

  // Function to add default meta tags for non-pet pages
  function addDefaultMetaTags(html: string): string {
    const metaBaseUrl = 'https://peludosclick.com';
    const defaultImage = `${metaBaseUrl}/assets/main/cat-dog-free-safe-with-medal-peldudosclick-into-buenos-aires.jpeg`;
    const defaultTitle = 'PeludosClick - Chapitas QR para mascotas';
    const defaultDescription = 'Mantén a tu mascota segura con nuestras chapitas QR. Escanea y contacta al dueño inmediatamente por WhatsApp.';
    const defaultUrl = metaBaseUrl;

    const metaTags = `
    <!-- Primary Meta Tags -->
    <meta name="title" content="${defaultTitle}">
    <meta name="description" content="${defaultDescription}">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="${defaultTitle}">
    <meta property="og:description" content="${defaultDescription}">
    <meta property="og:image" content="${defaultImage}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:type" content="image/jpeg">
    <meta property="og:image:alt" content="${defaultTitle}">
    <meta property="og:url" content="${defaultUrl}">
    <meta property="og:site_name" content="PeludosClick">
    <meta property="og:locale" content="es_LA">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${defaultTitle}">
    <meta name="twitter:description" content="${defaultDescription}">
    <meta name="twitter:image" content="${defaultImage}">
    <meta name="twitter:image:alt" content="${defaultTitle}">
    <meta name="twitter:site" content="@peludosClick">
    
    <!-- WhatsApp specific -->
    <meta property="og:image:secure_url" content="${defaultImage}">
    <meta name="robots" content="index, follow">
    <meta name="author" content="PeludosClick">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    `;

    // Replace the comment with default meta tags
    let updatedHtml = html.replace(
      /<!-- Meta tags will be generated dynamically by the server -->/,
      metaTags
    );

    // Update title
    updatedHtml = updatedHtml.replace(
      /<title>[^<]*<\/title>/g,
      `<title>${defaultTitle}</title>`
    );

    return updatedHtml;
  }

  // WhatsApp cache clearing endpoint
  server.get('/whatsapp-cache-clear', (req, res) => {
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Content-Type': 'text/plain'
    });
    res.send('Cache cleared');
  });

  // All regular routes use the Angular engine
  server.get('*', async (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    // Add cache control headers for social media crawlers
    const userAgent = headers['user-agent'] || '';
    const isSocialMediaBot = userAgent.includes('facebookexternalhit') || 
                            userAgent.includes('WhatsApp') || 
                            userAgent.includes('Twitterbot') || 
                            userAgent.includes('LinkedInBot');

    if (isSocialMediaBot) {
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
    }

    // Check if this is a pet page
    const petMatch = originalUrl.match(/\/mascota(?:-publica)?\/([^\/\?]+)/);
    
    if (petMatch) {
      const medalString = petMatch[1];
      const isPublicPage = originalUrl.includes('/mascota-publica/');
      
      try {
        // Fetch pet data
        const pet = await fetchPetData(medalString);
        
        // Render the page
        const html = await commonEngine.render({
          bootstrap,
          documentFilePath: indexHtml,
          url: `${protocol}://${headers.host}${originalUrl}`,
          publicPath: distFolder,
          providers: [
            { provide: APP_BASE_HREF, useValue: baseUrl },
            { provide: 'NODE_ENV', useValue: 'production' }
          ],
        });

        // Update meta tags with pet data
        const updatedHtml = updateMetaTags(html, pet, medalString, isPublicPage, userAgent);
        
        res.send(updatedHtml);
      } catch (error) {
        console.error('Error fetching pet data:', error);
        // Fallback to normal rendering
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
      }
         } else {
       // Normal rendering for non-pet pages
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
         .then((html) => {
           // Add default meta tags for non-pet pages
           const updatedHtml = addDefaultMetaTags(html);
           res.send(updatedHtml);
         })
         .catch((err) => next(err));
     }
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
