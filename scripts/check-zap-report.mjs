import { readFileSync } from "node:fs";

const reportPath = process.argv[2] ?? "report_json.json";
const report = JSON.parse(readFileSync(reportPath, "utf8"));
if (!Array.isArray(report.site) || report.site.length === 0) {
  throw new Error("ZAP report has no site results; refusing to treat an empty scan as clean.");
}

const alerts = report.site.flatMap((site) => Array.isArray(site.alerts) ? site.alerts : []);
const actionable = alerts.filter((alert) => Number(alert.riskcode) >= 1);
const informational = alerts.filter((alert) => Number(alert.riskcode) === 0);

if (actionable.length) {
  console.error("OWASP ZAP found " + actionable.length + " actionable alert(s):");
  for (const alert of actionable) {
    console.error("- " + (alert.riskdesc ?? "Unclassified risk") + ": " + (alert.alert ?? "Unnamed alert"));
    for (const instance of (alert.instances ?? []).slice(0, 5)) {
      console.error("  " + (instance.uri ?? "Unknown URL"));
    }
  }
  process.exit(1);
}

console.log("OWASP ZAP gate passed: 0 actionable alerts; " + informational.length + " informational alert(s) retained for review.");
