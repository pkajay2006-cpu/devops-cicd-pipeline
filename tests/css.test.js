const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const CSS_PATH = path.join(__dirname, '..', 'style.css');

test('CSS Test Suite: Validating Stylesheet, Theme & Responsiveness', async (t) => {
  await t.test('style.css must exist and have content', () => {
    assert.ok(fs.existsSync(CSS_PATH), 'style.css does not exist in workspace');
    const content = fs.readFileSync(CSS_PATH, 'utf-8');
    assert.ok(content.length > 500, 'style.css is empty or too short');
  });

  const css = fs.readFileSync(CSS_PATH, 'utf-8');

  await t.test('Root custom properties (variables) must define dark-and-blue theme tokens', () => {
    assert.match(css, /--bg-dark:/, 'Missing --bg-dark color token');
    assert.match(css, /--bg-primary:/, 'Missing --bg-primary color token');
    assert.match(css, /--primary-blue:/, 'Missing --primary-blue color token');
    assert.match(css, /--accent-cyan:/, 'Missing --accent-cyan color token');
    assert.match(css, /--text-main:/, 'Missing --text-main color token');
  });

  await t.test('Essential component classes must be declared', () => {
    const requiredSelectors = [
      '.navbar',
      '.hero-section',
      '.metric-card',
      '.card',
      '.pipeline-track',
      '.pipe-node',
      '.simulator-wrapper',
      '.sim-console',
      '.terminal-card',
      '.footer'
    ];

    for (const selector of requiredSelectors) {
      assert.ok(css.includes(selector), `Required CSS selector '${selector}' is missing in style.css`);
    }
  });

  await t.test('Responsive media queries must be configured for mobile/tablet', () => {
    assert.match(css, /@media\s*\([^)]*max-width:\s*768px[^)]*\)/, 'Missing mobile media query (max-width: 768px)');
    assert.match(css, /\.mobile-toggle/, 'Missing .mobile-toggle responsive styling');
  });

  await t.test('CSS curly braces balance check (syntax integrity)', () => {
    let openBraces = 0;
    let closeBraces = 0;
    for (const char of css) {
      if (char === '{') openBraces++;
      if (char === '}') closeBraces++;
    }
    assert.equal(openBraces, closeBraces, `Unbalanced braces in style.css: ${openBraces} open vs ${closeBraces} close`);
  });
});
