# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please report it via [GitHub Security Advisories](https://github.com/jschuller/perplexity-mcp/security/advisories/new) (preferred) or email.

- **Response time:** Acknowledgment within 48 hours, assessment within 1 week
- **Please do not** open a public issue for security vulnerabilities

## Supported Versions

| Version | Supported |
|---------|-----------|
| 2.x     | Yes       |
| < 2.0   | No        |

## Security Practices

- API keys are read from environment variables only — never hardcoded or logged
- The server communicates exclusively with `api.perplexity.ai` over HTTPS
- No persistent data storage
- Dependencies managed with lockfile pinning and automated updates via Renovate
