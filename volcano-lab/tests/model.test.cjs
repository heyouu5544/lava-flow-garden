const test = require('node:test');
const assert = require('node:assert/strict');
const { calculate, clamp } = require('../js/model.js');

test('inputs are finite, rounded and clamped to the teaching range', () => {
  assert.equal(clamp(-20), 0); assert.equal(clamp(120), 100);
  assert.equal(clamp('70.7'), 71); assert.equal(clamp(NaN), 40);
  assert.equal(clamp(Infinity), 40);
});
test('all slider combinations yield bounded metrics and useful explanations', () => {
  for (let v = 0; v <= 100; v++) for (let g = 0; g <= 100; g++) {
    const r = calculate(v, g);
    for (const key of ['flow', 'ash', 'intensity', 'hazard']) {
      assert.ok(Number.isInteger(r[key]) && r[key] >= 0 && r[key] <= 100);
    }
    assert.ok(r.explanation.length > 60 && r.suggestion.length > 10);
  }
});
test('viscosity reduces lava spread and amplifies gas-rich explosive activity', () => {
  for (let gas = 0; gas <= 100; gas++) {
    let previous = calculate(0, gas);
    for (let v = 1; v <= 100; v++) {
      const next = calculate(v, gas);
      assert.ok(next.flow <= previous.flow);
      assert.ok(next.ash >= previous.ash && next.intensity >= previous.intensity);
      previous = next;
    }
  }
});
test('more gas increases activity at every viscosity', () => {
  for (let v = 0; v <= 100; v++) {
    let previous = calculate(v, 0);
    for (let gas = 1; gas <= 100; gas++) {
      const next = calculate(v, gas);
      assert.ok(next.ash >= previous.ash && next.intensity >= previous.intensity);
      assert.ok(next.hazard >= previous.hazard); previous = next;
    }
  }
});
test('contrasting experiments differ clearly; high viscosity alone is not explosive', () => {
  const fluid = calculate(15, 15), explosive = calculate(90, 90), thick = calculate(100, 0);
  assert.ok(fluid.flow - explosive.flow > 40);
  assert.ok(explosive.ash - fluid.ash > 60);
  assert.ok(explosive.intensity - fluid.intensity > 60);
  assert.ok(thick.intensity < 15);
  assert.ok(calculate(0, 0).hazard > 30, 'fluid lava still contributes to hazard');
});
