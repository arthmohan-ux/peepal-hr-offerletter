#!/usr/bin/env node
/**
 * Netlify build step — substitutes credential placeholders in the HTML with
 * values pulled from environment variables. Runs on every deploy.
 *
 * Required env vars:
 *   ADMIN_USER, ADMIN_PASS, HR_USER, HR_PASS
 *
 * The placeholder tokens (__ADMIN_USER__, __ADMIN_PASS__, __HR_USER__,
 * __HR_PASS__) live inside the CREDS object in the HTML. Missing env vars
 * fall through to obviously-invalid defaults so a misconfigured deploy fails
 * loudly at login instead of silently letting anyone in.
 */

const fs = require('fs');
const path = require('path');

const HTML_FILE = 'Peepal_Letter_Generator_V2.13.html';

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

let hits = 0;
for (const [token, value] of Object.entries(subs)) {
  const before = html.length;
  html = html.split(token).join(value);
  const found = (before - html.length) / (token.length - value.length);
  console.log(`[inject-secrets] ${token} → replaced ${isFinite(found) ? found : '?'} time(s)`);
  hits += Math.max(0, before - html.length !== 0 ? 1 : 0);
}

fs.writeFileSync(target, html);
console.log(`[inject-secrets] done — wrote ${target}`);
