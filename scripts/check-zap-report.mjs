import { readFileSync } from "node:fs";

const reportPath = process.argv[2] ?? "report_json.json";
const report = JSON.parse(readFileSync(reportPath, "utf8"));
if (!Array.isArray(report.site) || report.site.length === 0) {
  throw new Error("ZAP report has no site results; refusing to treat an empty scan as clean.");
}

const alerts = report.site.flatMap((site) => Array.isArray(site.alerts) ? site.alerts : []);
const isKnownVisibleCopyFalsePositive = (alert) => {
  if (String(alert.pluginid ?? alert.alertRef ?? "") !== "10099") return false;
  const instances = alert.instances;
  if (!Array.isArray(instances) || instances.length === 0) return false;
  return instances.every((instance) => {
    try {
      const url = new URL(instance.uri);
      return url.origin === "https://toolora.gettoolora.workers.dev"
        && url.pathname === "/tools/image-converter/"
        && instance.evidence?.trim() === "Select the source image from your device.";
    } catch {
      return false;
    }
  });
};

const knownFalsePositives = alerts.filter(isKnownVisibleCopyFalsePositive);
const actionable = alerts.filter((alert) => Number(alert.riskcode) >= 1 && !isKnownVisibleCopyFalsePositive(alert));
const informational = alerts.filter((alert) => Number(alert.riskcode) === 0);

for (const alert of knownFalsePositives) {
  console.warn("Suppressed exact-match ZAP false positive (10099): visible image-converter instruction copy was classified as SQL source code; all reported instances matched the approved route and exact evidence.");
}

if (actionable.length) {
  console.error("OWASP ZAP found " + actionable.length + " actionable alert(s):");
  for (const alert of actionable) {
    console.error("- " + (alert.riskdesc ?? "Unclassified risk") + ": " + (alert.alert ?? "Unnamed alert"));
    for (const instance of (alert.instances ?? []).slice(0, 5)) {
      console.error("  " + (instance.uri ?? "Unknown URL"));
      if (instance.evidence) console.error("    Evidence: " + instance.evidence);
    }
  }
  process.exit(1);
}

console.log("OWASP ZAP gate passed: 0 actionable alerts; " + knownFalsePositives.length + " exact-match false positive(s) suppressed; " + informational.length + " informational alert(s) retained for review.");
