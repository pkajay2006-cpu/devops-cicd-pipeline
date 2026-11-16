const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const JS_PATH = path.join(__dirname, '..', 'script.js');

test('JavaScript Test Suite: Validating Client Logic & Simulator Engine', async (t) => {
  await t.test('script.js must exist and have content', () => {
    assert.ok(fs.existsSync(JS_PATH), 'script.js does not exist in workspace');
    const content = fs.readFileSync(JS_PATH, 'utf-8');
    assert.ok(content.length > 200, 'script.js is empty or too short');
  });

  // Verify module can be loaded cleanly
  let scriptModule;
  await t.test('script.js must load without syntax or runtime errors', () => {
    assert.doesNotThrow(() => {
      scriptModule = require('../script.js');
    }, 'Failed to require script.js');
    assert.ok(scriptModule, 'Module did not export expected items');
  });

  await t.test('formatTimestamp() should return valid HH:MM:SS format', () => {
    const fixedDate = new Date(2026, 10, 16, 9, 5, 7);
    const formatted = scriptModule.formatTimestamp(fixedDate);
    assert.equal(formatted, '09:05:07');
    assert.match(formatted, /^\d{2}:\d{2}:\d{2}$/);
  });

  await t.test('PIPELINE_STEPS must contain 7 stages with valid properties', () => {
    const { PIPELINE_STEPS } = scriptModule;
    assert.ok(Array.isArray(PIPELINE_STEPS), 'PIPELINE_STEPS should be an array');
    assert.equal(PIPELINE_STEPS.length, 7, 'Expected 7 pipeline workflow stages');

    PIPELINE_STEPS.forEach((item, idx) => {
      assert.equal(item.step, idx + 1, `Stage ${idx + 1} has incorrect step number`);
      assert.ok(typeof item.title === 'string' && item.title.length > 0, `Stage ${idx + 1} missing title`);
      assert.ok(typeof item.desc === 'string' && item.desc.length > 0, `Stage ${idx + 1} missing desc`);
    });
  });

  await t.test('SIMULATOR_STAGES must contain sequential progress culminating at 100%', () => {
    const { SIMULATOR_STAGES } = scriptModule;
    assert.ok(Array.isArray(SIMULATOR_STAGES), 'SIMULATOR_STAGES should be an array');
    assert.ok(SIMULATOR_STAGES.length >= 5, 'Simulator requires at least 5 progression stages');

    let prevProgress = 0;
    SIMULATOR_STAGES.forEach((stage, idx) => {
      assert.ok(stage.progress > prevProgress, `Stage ${idx} progress must be strictly increasing`);
      assert.ok(stage.progress <= 100, `Stage ${idx} progress cannot exceed 100`);
      assert.ok(stage.message && typeof stage.message === 'string', `Stage ${idx} missing log message`);
      prevProgress = stage.progress;
    });

    assert.equal(SIMULATOR_STAGES[SIMULATOR_STAGES.length - 1].progress, 100, 'Final stage must reach 100%');
  });

  await t.test('getSimulatorStage() returns correct stage object or null on bounds', () => {
    const { getSimulatorStage, SIMULATOR_STAGES } = scriptModule;
    assert.equal(getSimulatorStage(0).progress, SIMULATOR_STAGES[0].progress);
    assert.equal(getSimulatorStage(SIMULATOR_STAGES.length - 1).progress, 100);
    assert.equal(getSimulatorStage(-1), null, 'Negative index must return null');
    assert.equal(getSimulatorStage(999), null, 'Out of bounds index must return null');
  });
});
