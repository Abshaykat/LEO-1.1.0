import assert from "node:assert/strict";
import { LEO_ROOT, WORKSPACE_ROOT, assertInside } from "./leo-config.ts";

assert.equal(typeof LEO_ROOT, "string");
assert.equal(typeof WORKSPACE_ROOT, "string");
assert.equal(assertInside(LEO_ROOT, LEO_ROOT), LEO_ROOT);
assert.throws(() => assertInside(LEO_ROOT, "/tmp/outside"));
console.log("L.E.O. config/path policy test passed.");
