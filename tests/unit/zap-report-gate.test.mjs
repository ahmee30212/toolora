import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

const checker = resolve("scripts/check-zap-report.mjs");
const productionImageConverter = "https://toolora.gettoolora.workers.dev/tools/image-converter/";
const visibleInstruction = "Select the source image from your device.";

function runGate(alerts) {
  const directory = mkdtempSync(join(tmpdir(), "toolora-zap-gate-"));
  const reportPath = join(directory, "report.json");
  writeFileSync(reportPath, JSON.stringify({ site: [{ alerts }] }));
  const result = spawnSync(process.execPath, [checker, reportPath], { encoding: "utf8" });
  rmSync(directory, { recursive: true, force: true });
  return result;
}

test("suppresses only the exact image-converter visible-copy false positive", () => {
  const result = runGate([{
    pluginid: "10099",
    alert: "Source Code Disclosure - SQL",
    riskcode: "2",
    instances: [
      { uri: productionImageConverter, evidence: visibleInstruction },
      { uri: productionImageConverter + "?displayName=ZAP&rating=5&review", evidence: visibleInstruction }
    ]
  }]);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stderr, /exact-match ZAP false positive/);
  assert.match(result.stdout, /0 actionable alerts/);
  assert.match(result.stdout, /1 exact-match false positive/);
});

test("does not suppress SQL-like evidence on the image-converter route", () => {
  const result = runGate([{
    pluginid: "10099",
    alert: "Source Code Disclosure - SQL",
    riskcode: "2",
    instances: [{ uri: productionImageConverter, evidence: "SELECT * FROM users;" }]
  }]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /1 actionable alert/);
  assert.match(result.stderr, /SELECT \* FROM users/);
});

test("does not suppress the same visible text on an unrelated route", () => {
  const result = runGate([{
    pluginid: "10099",
    alert: "Source Code Disclosure - SQL",
    riskcode: "2",
    instances: [{
      uri: "https://toolora.gettoolora.workers.dev/tools/json-formatter/",
      evidence: visibleInstruction
    }]
  }]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /1 actionable alert/);
});

test("refuses an empty ZAP report", () => {
  const directory = mkdtempSync(join(tmpdir(), "toolora-zap-empty-"));
  const reportPath = join(directory, "report.json");
  writeFileSync(reportPath, JSON.stringify({ site: [] }));
  const result = spawnSync(process.execPath, [checker, reportPath], { encoding: "utf8" });
  rmSync(directory, { recursive: true, force: true });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /no site results/);
});
