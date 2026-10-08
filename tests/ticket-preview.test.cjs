const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const Module = require("node:module");
const filename = path.resolve(__dirname, "../lib/ticket-preview.ts");
const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
const loaded = new Module(filename, module);
loaded._compile(compiled.outputText, filename);
const { parseTicketOrder, mergeTicketOrder, inspectAdmission, checkInAdmission } = loaded.exports;
const token = "swiftree:test:00000000-0000-4000-8000-000000000001";
const fixture = () => ({
  version: 1, mode: "preview", id: "TEST-one", storeId: "mockevent", eventId: "evt_001",
  eventName: "Test event", eventDate: "2026-12-20", location: "Lagos", createdAt: "2026-10-08T10:00:00Z",
  customer: { firstName: "Test", lastName: "Buyer", email: "test@example.com", whatsapp: "+2348000000000" },
  total: 5000, status: "confirmed", channel: "website",
  admissions: [{ id: "one", token, ticketTypeId: "general", ticketName: "General", checkedInAt: null }],
});
test("valid paid and free preview bookings parse", () => {
  assert.equal(parseTicketOrder(fixture()).total, 5000);
  assert.equal(parseTicketOrder({ ...fixture(), total: 0 }).total, 0);
});
test("malformed, live and negative-total bookings are rejected", () => {
  for (const value of [null, {}, { ...fixture(), mode: "live" }, { ...fixture(), total: -1 }, { ...fixture(), total: Infinity }, { ...fixture(), admissions: [] }]) {
    assert.throws(() => parseTicketOrder(value));
  }
});
test("duplicate tokens inside a booking are rejected", () => {
  const order = fixture(); order.admissions.push({ ...order.admissions[0], id: "two" });
  assert.throws(() => parseTicketOrder(order));
});
test("wrong-event, unknown and cancelled admissions are rejected", () => {
  assert.throws(() => inspectAdmission([fixture()], token, "evt_002"), /different event/);
  assert.throws(() => inspectAdmission([fixture()], "unknown", "evt_001"), /not found/);
  assert.throws(() => inspectAdmission([{ ...fixture(), status: "cancelled" }], token, "evt_001"), /cancelled/);
});
test("check-in changes only the selected ticket and rejects a duplicate scan", () => {
  const order = fixture();
  order.admissions.push({ ...order.admissions[0], id: "two", token: token.replace(/1$/, "2") });
  const next = checkInAdmission([order], token, "evt_001", "2026-12-20T18:00:00Z");
  assert.equal(next[0].admissions[0].checkedInAt, "2026-12-20T18:00:00Z");
  assert.equal(next[0].admissions[1].checkedInAt, null);
  assert.equal(order.admissions[0].checkedInAt, null);
  assert.throws(() => checkInAdmission(next, token, "evt_001", "2026-12-20T18:01:00Z"), /Already checked in/);
});
test("re-import cannot reset check-in or cancellation", () => {
  const next = checkInAdmission([fixture()], token, "evt_001", "2026-12-20T18:00:00Z");
  next[0].status = "cancelled";
  assert.equal(mergeTicketOrder(next, fixture()), next);
});
test("a token cannot be reused by a different booking", () => {
  assert.throws(() => mergeTicketOrder([fixture()], { ...fixture(), id: "TEST-two" }), /already belongs/);
});

