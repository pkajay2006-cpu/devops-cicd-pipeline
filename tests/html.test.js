const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const HTML_PATH = path.join(__dirname, '..', 'index.html');

test('HTML Test Suite: Validating Website Markup & Structure', async (t) => {
  await t.test('index.html must exist and have content', () => {
    assert.ok(fs.existsSync(HTML_PATH), 'index.html does not exist in workspace');
    const content = fs.readFileSync(HTML_PATH, 'utf-8');
    assert.ok(content.length > 500, 'index.html is empty or too short');
  });

  const html = fs.readFileSync(HTML_PATH, 'utf-8');

  await t.test('Document must declare HTML5 DOCTYPE and language', () => {
    assert.match(html, /<!DOCTYPE\s+html>/i, 'Missing or invalid <!DOCTYPE html>');
    assert.match(html, /<html\s+lang=["']en["']/i, 'Missing <html lang="en"> attribute');
  });

  await t.test('Head section must include required metadata', () => {
    assert.match(html, /<meta\s+charset=["']UTF-8["']/i, 'Missing UTF-8 charset declaration');
    assert.match(html, /<meta\s+name=["']viewport["']/i, 'Missing viewport meta tag for mobile responsiveness');
    assert.match(html, /<title>DevOps CI\/CD Automation Dashboard<\/title>/, 'Missing or incorrect <title> tag');
  });

  await t.test('Document must link stylesheet and script', () => {
    assert.match(html, /<link\s+[^>]*rel=["']stylesheet["'][^>]*href=["']style\.css["']/i, 'Missing style.css link');
    assert.match(html, /<script\s+[^>]*src=["']script\.js["']/i, 'Missing script.js script tag');
  });

  await t.test('All 10 required dashboard sections must exist by ID', () => {
    const requiredSections = [
      'hero',
      'overview',
      'what-is-devops',
      'ci-section',
      'cd-section',
      'workflow-diagram',
      'tech-stack',
      'deployment-status',
      'features',
      'about'
    ];

    for (const sectionId of requiredSections) {
      const regex = new RegExp(`id=["']${sectionId}["']`, 'i');
      assert.ok(regex.test(html), `Required section ID '#${sectionId}' is missing from index.html`);
    }
  });

  await t.test('Essential interactive simulator controls must exist', () => {
    assert.match(html, /id=["']btn-start-sim["']/, 'Missing simulator start button (#btn-start-sim)');
    assert.match(html, /id=["']btn-reset-sim["']/, 'Missing simulator reset button (#btn-reset-sim)');
    assert.match(html, /id=["']pipeline-progress["']/, 'Missing pipeline progress bar (#pipeline-progress)');
    assert.match(html, /id=["']console-output["']/, 'Missing simulated console output container (#console-output)');
    assert.match(html, /id=["']mobile-toggle["']/, 'Missing mobile navigation toggle (#mobile-toggle)');
  });

  await t.test('Semantic landmark tags must be properly utilized', () => {
    assert.match(html, /<header\b/i, 'Missing semantic <header>');
    assert.match(html, /<nav\b/i, 'Missing semantic <nav>');
    assert.match(html, /<main\b/i, 'Missing semantic <main>');
    assert.match(html, /<section\b/i, 'Missing semantic <section>');
    assert.match(html, /<footer\b/i, 'Missing semantic <footer>');
  });
});
