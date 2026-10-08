const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const Module = require("node:module");
function load(name) {
  const filename = path.resolve(__dirname, "../lib", name + ".ts");
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } });
  const module = new Module(filename);
  module.require = request => { if (request === "./v2") return load("v2"); throw new Error(request); };
  module._compile(output.outputText, filename);
  return module.exports;
}
const { switchToMarkup, effectiveModel, listingPrice, billingPreviewDefault } = load("billing-preview");
const now = Date.parse("2026-10-08T12:00:00Z");
const active = { ...billingPreviewDefault, expiresAt: "2026-10-09T12:00:00Z" };
test("active subscription schedules markup without changing prices", () => {
  const next = switchToMarkup(active, now);
  assert.equal(next.pendingMarkup, true);
  assert.equal(effectiveModel(next, now), "subscription");
  assert.deepEqual(listingPrice(5000, next, now), { base: 5000, markup: 0, total: 5000 });
});
test("expiry applies markup once while preserving base", () => {
  const next = switchToMarkup(active, now);
  assert.equal(listingPrice(5000, next, Date.parse(active.expiresAt)).total, 5500);
  assert.equal(listingPrice(5000, next, Date.parse(active.expiresAt)).total, 5500);
});
test("cancelling a scheduled change preserves subscription pricing", () => {
  const next = { ...switchToMarkup(active, now), pendingMarkup: false };
  assert.equal(effectiveModel(next, now), "subscription");
  assert.equal(listingPrice(5000, next, now).markup, 0);
});
test("no active paid period permits immediate markup", () => {
  assert.equal(switchToMarkup(billingPreviewDefault, now).model, "markup");
  assert.equal(switchToMarkup(active, Date.parse(active.expiresAt)).model, "markup");
});
test("ticketing always resolves to markup", () => {
  assert.equal(effectiveModel({ ...active, businessType: "ticketing" }, now), "markup");
});
test("invalid base prices fail", () => {
  for (const price of [-1, NaN, Infinity]) assert.throws(() => listingPrice(price, active, now));
});
