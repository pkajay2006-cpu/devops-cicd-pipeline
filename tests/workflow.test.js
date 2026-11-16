const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const WORKFLOW_PATH = path.join(__dirname, '..', '.github', 'workflows', 'deploy.yml');

test('GitHub Actions Workflow Test Suite: Validating CI/CD Pipeline Configuration', async (t) => {
  await t.test('.github/workflows/deploy.yml must exist and be readable', () => {
    assert.ok(fs.existsSync(WORKFLOW_PATH), 'deploy.yml is missing in .github/workflows/');
    const content = fs.readFileSync(WORKFLOW_PATH, 'utf-8');
    assert.ok(content.length > 200, 'deploy.yml is empty or too small');
  });

  const yaml = fs.readFileSync(WORKFLOW_PATH, 'utf-8');

  await t.test('Workflow must have a valid descriptive name', () => {
    assert.match(yaml, /name:\s*DevOps CI\/CD Pipeline/, 'Workflow name is missing or altered');
  });

  await t.test('Triggers (on:) must include push to main, pull_request to main, and workflow_dispatch', () => {
    assert.match(yaml, /push:\s*\n\s*branches:\s*\[\s*["']main["']\s*\]/, 'Missing push trigger on main branch');
    assert.match(yaml, /pull_request:\s*\n\s*branches:\s*\[\s*["']main["']\s*\]/, 'Missing pull_request trigger on main branch');
    assert.match(yaml, /workflow_dispatch:/, 'Missing workflow_dispatch trigger for manual test runs');
  });

  await t.test('Permissions must configure least-privilege security for GitHub Pages', () => {
    assert.match(yaml, /contents:\s*read/, 'Missing contents: read permission');
    assert.match(yaml, /pages:\s*write/, 'Missing pages: write permission');
    assert.match(yaml, /id-token:\s*write/, 'Missing id-token: write permission for OIDC authentication');
  });

  await t.test('Pipeline must define separated test (CI) and deploy (CD) jobs', () => {
    assert.match(yaml, /\btest:\s*\n/, 'Missing test CI job definition');
    assert.match(yaml, /\bdeploy:\s*\n/, 'Missing deploy CD job definition');
  });

  await t.test('Deploy job must depend on test job (quality gate)', () => {
    assert.match(yaml, /needs:\s*test/, 'Deploy job does not declare "needs: test" dependency');
  });

  await t.test('Deploy job must only run on main branch pushes (not PRs)', () => {
    assert.match(yaml, /github\.ref\s*==\s*['"]refs\/heads\/main['"]/, 'Deploy job missing branch protection check');
    assert.match(yaml, /github\.event_name\s*!=\s*['"]pull_request['"]/, 'Deploy job must exclude pull requests');
  });

  await t.test('Workflow must use official GitHub Actions for checkout, setup, and deployment', () => {
    assert.match(yaml, /actions\/checkout@v4/, 'Missing actions/checkout@v4');
    assert.match(yaml, /actions\/setup-node@v4/, 'Missing actions/setup-node@v4');
    assert.match(yaml, /actions\/configure-pages@v5/, 'Missing actions/configure-pages@v5');
    assert.match(yaml, /actions\/upload-pages-artifact@v3/, 'Missing actions/upload-pages-artifact@v3');
    assert.match(yaml, /actions\/deploy-pages@v4/, 'Missing actions/deploy-pages@v4');
  });

  await t.test('Workflow must execute npm test during CI', () => {
    assert.match(yaml, /run:\s*npm\s+test/, 'CI job does not execute "npm test"');
  });
});
