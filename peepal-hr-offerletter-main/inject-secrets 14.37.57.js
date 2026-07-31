#!/usr/bin/env node
/**
 * Netlify build step — substitutes credential placeholders in the HTML with
 * values pulled from environment variables. Runs on every deploy.
 *
 * Required env vars:
 *   ADMIN_USER, ADMIN_PASS, HR_USER, HR_PASS
 */

const fs = require('fs');
const path = require('path');

const HTML_FILE = 'Peepal_Letter_Generator_V2.14.html';

const req = (name) => {
  const v = process.env[name];
  if (!v) {
    console.warn(`[inject-secrets] WARNING: ${name} is not set — login for that role will fail`);
    return `__MISSING_${name}__`;
  }
  return v;
};

const subs = {
  '__ADMIN_USER__': req('ADMIN_USER'),
  '__ADMIN_PASS__': req('ADMIN_PASS'),
  '__HR_USER__':    req('HR_USER'),
  '__HR_PASS__':    req('HR_PASS')
};

const target = path.join(__dirname, HTML_FILE);
let html = fs.readFileSync(target, 'utf8');

for (const [token, value] of Object.entries(subs)) {
  const before = html.length;
  html = html.split(token).join(value);
  console.log(`[inject-secrets] ${token} → replaced (delta ${before - html.length} chars)`);
}

fs.writeFileSync(target, html);
console.log(`[inject-secrets] done — wrote ${target}`);
