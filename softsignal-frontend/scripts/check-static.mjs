#!/usr/bin/env node

/**
 * Static Export Validation Script
 * Checks for violations of Next.js static export rules:
 * - No SSR (getServerSideProps)
 * - No ISR (revalidate)
 * - No API routes
 * - No server components with dynamic imports
 * - Dynamic routes must have generateStaticParams
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FRONTEND_ROOT = path.resolve(__dirname, '..');
const APP_DIR = path.join(FRONTEND_ROOT, 'app');
const PAGES_DIR = path.join(FRONTEND_ROOT, 'pages');

let hasErrors = false;

console.log('🔍 Checking for static export violations...\n');

// Prohibited patterns
const prohibitedPatterns = [
  { pattern: /getServerSideProps/, message: 'getServerSideProps (SSR)' },
  { pattern: /export\s+const\s+revalidate/, message: 'ISR (revalidate)' },
  { pattern: /from\s+['"]next\/headers['"]/, message: 'next/headers (server-only)' },
  { pattern: /from\s+['"]server-only['"]/, message: 'server-only imports' },
  { pattern: /cookies\(\)/, message: 'cookies() function' },
  { pattern: /headers\(\)/, message: 'headers() function' },
  { pattern: /export\s+const\s+dynamic\s*=\s*['"]force-dynamic['"]/, message: 'force-dynamic' },
];

// Recursively scan directory
function scanDirectory(dir, basePath = '') {
  if (!fs.existsSync(dir)) {
    return;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(basePath, entry.name);

    if (entry.isDirectory()) {
      // Check for API routes
      if (entry.name === 'api') {
        console.error(`❌ API route detected: ${relativePath}`);
        console.error('   Static export does not support API routes\n');
        hasErrors = true;
        continue;
      }

      // Check for dynamic routes without generateStaticParams
      if (entry.name.includes('[') && entry.name.includes(']')) {
        const pageFile = path.join(fullPath, 'page.tsx');
        if (fs.existsSync(pageFile)) {
          const content = fs.readFileSync(pageFile, 'utf-8');
          if (!content.includes('generateStaticParams')) {
            console.error(`❌ Dynamic route without generateStaticParams: ${relativePath}`);
            console.error('   Dynamic routes must export generateStaticParams\n');
            hasErrors = true;
          }
        }
      }

      scanDirectory(fullPath, relativePath);
    } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      // Scan file for prohibited patterns
      const content = fs.readFileSync(fullPath, 'utf-8');

      for (const { pattern, message } of prohibitedPatterns) {
        if (pattern.test(content)) {
          console.error(`❌ Found prohibited pattern in ${relativePath}:`);
          console.error(`   ${message}\n`);
          hasErrors = true;
        }
      }
    }
  }
}

// Check app directory
if (fs.existsSync(APP_DIR)) {
  console.log('📁 Scanning app/ directory...');
  scanDirectory(APP_DIR, 'app');
}

// Check pages directory
if (fs.existsSync(PAGES_DIR)) {
  console.log('📁 Scanning pages/ directory...');
  scanDirectory(PAGES_DIR, 'pages');
}

// Check next.config
const nextConfigPath = path.join(FRONTEND_ROOT, 'next.config.ts');
if (fs.existsSync(nextConfigPath)) {
  const configContent = fs.readFileSync(nextConfigPath, 'utf-8');
  
  if (!configContent.includes('output: "export"')) {
    console.error('❌ next.config.ts missing: output: "export"\n');
    hasErrors = true;
  }
  
  if (!configContent.includes('unoptimized: true')) {
    console.error('❌ next.config.ts missing: images.unoptimized: true\n');
    hasErrors = true;
  }
  
  if (!configContent.includes('trailingSlash: true')) {
    console.error('❌ next.config.ts missing: trailingSlash: true\n');
    hasErrors = true;
  }
}

// Summary
if (hasErrors) {
  console.error('❌ Static export validation FAILED');
  console.error('   Fix the above issues before building\n');
  process.exit(1);
} else {
  console.log('✅ Static export validation PASSED');
  console.log('   No violations detected\n');
  process.exit(0);
}

