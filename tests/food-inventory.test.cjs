const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const Module = require("node:module");
const filename = path.resolve(__dirname, "../lib/food-inventory.ts");
const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } });
const loaded = new Module(filename);
loaded._compile(compiled.outputText, filename);
const { PLATFORM_UNITS, emptyInventory, uniqueName, inventoryStatus, validateItem, parseInventory } = loaded.exports;
const item = () => ({ id: "item", name: "Rice", description: "", quantity: 2, unitId: "platform-kg",
  price: 1000, secondPrice: null, categoryId: "", images: [], lowStock: true, threshold: 4 });
test("platform units match the reference", () => {
  assert.deepEqual(PLATFORM_UNITS.map(unit => unit.name), ["Pack", "Pieces", "Kg", "Gram", "Litre", "Gallon"]);
});
test("new categories and custom units are valid item references", () => {
  const data = emptyInventory();
  data.categories.push({ id: "grains", name: "Grains", description: "", allBranches: true });
  data.units.push({ id: "bag", name: "Bag", abbreviation: "bg", description: "", allBranches: false });
  data.items.push({ ...item(), categoryId: "grains", unitId: "bag" });
  assert.deepEqual(parseInventory(JSON.stringify(data)), data);
});
test("duplicate names ignore case and repeated whitespace", () => {
  assert.equal(uniqueName(" rice   bag ", [{ id: "one", name: "Rice Bag" }]), false);
  assert.equal(uniqueName("Rice Bag", [{ id: "one", name: "Rice Bag" }], "one"), true);
});
test("invalid references and prices fail", () => {
  for (const overrides of [{ unitId: "missing" }, { categoryId: "missing" }, { quantity: -1 }, { price: Infinity }, { secondPrice: -1 }, { images: Array(6).fill("x") }]) {
    assert.throws(() => validateItem({ ...item(), ...overrides }, emptyInventory()));
  }
});
test("stock status honors toggle and threshold", () => {
  assert.equal(inventoryStatus(item()), "Low stock");
  assert.equal(inventoryStatus({ ...item(), lowStock: false }), "In stock");
  assert.equal(inventoryStatus({ ...item(), quantity: 0 }), "Out of stock");
});
test("corrupt persistence and injected platform units are rejected", () => {
  assert.throws(() => parseInventory("{}"));
  assert.throws(() => parseInventory(JSON.stringify({ ...emptyInventory(), units: [PLATFORM_UNITS[0]] })));
});
