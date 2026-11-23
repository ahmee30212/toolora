# Security Policy

## Supported version

Security fixes are developed against the latest commit on the main branch. Older commits and unofficial forks are not supported.

## Reporting a vulnerability

Please do not publish exploit details in a public issue or discussion.

Use GitHub's private vulnerability reporting or a private security advisory for this repository when that feature is available. If it is not available, request a private disclosure channel through the repository owner's GitHub profile before sharing technical details.

Include, where possible:

- The affected route, tool or dependency
- Browser and operating-system details
- Reproduction steps and expected versus actual behavior
- Security impact and a minimal proof of concept
- Any suggested mitigation

Do not include real user files, credentials, personal data or other sensitive information in a report.

## Security controls

Toolora uses dependency auditing, CodeQL static analysis, a passive OWASP ZAP Baseline production scan, browser end-to-end tests, security response headers, Subresource Integrity for its QR-code CDN resource and browser-side file-processing limits.

PDF.js and jsPDF are pinned npm dependencies bundled with the site. PDF rendering uses a same-origin worker and local runtime assets.

## Scope and limitations

Reports concerning Toolora's source code, deployment configuration, response headers, browser-side processing or dependency integration are in scope. Issues solely within third-party services should be reported to their respective maintainers, while explaining any impact on Toolora.

The OWASP ZAP Baseline scan is passive and is not a full penetration test. Automated checks reduce risk but cannot prove the absence of all vulnerabilities. No bug bounty is currently offered.
