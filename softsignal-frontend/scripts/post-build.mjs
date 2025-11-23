#!/usr/bin/env node
/**
 * Post-build script to create routes-manifest.json for Vercel
 * This is required for Next.js static export on Vercel
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.resolve(__dirname, '..', 'out');

// Create routes-manifest.json for Vercel
const routesManifest = {
  version: 3,
  pages404: true,
  basePath: '',
  redirects: [],
  rewrites: [],
  headers: [],
  staticRoutes: [],
  dynamicRoutes: [],
  dataRoutes: [],
  rsc: {
    header: 'RSC',
    varyHeader: 'RSC, Next-Router-State-Tree, Next-Router-Prefetch',
    prefetchHeader: 'Next-Router-Prefetch',
  },
};

// Find all static HTML files
if (fs.existsSync(outDir)) {
  const findHtmlFiles = (dir, basePath = '') => {
    const files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.join(basePath, entry.name);
      
      if (entry.isDirectory()) {
        files.push(...findHtmlFiles(fullPath, relativePath));
      } else if (entry.name.endsWith('.html')) {
        const route = relativePath.replace(/\.html$/, '').replace(/\/index$/, '') || '/';
        files.push({
          page: route,
          regex: `^${route.replace(/\//g, '\\/')}$`,
        });
      }
    }
    return files;
  };
  
  routesManifest.staticRoutes = findHtmlFiles(outDir);
}

const manifestPath = path.join(outDir, 'routes-manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(routesManifest, null, 2));
console.log('✅ Created routes-manifest.json for Vercel');


