# Security

TYNEX treats repository files as untrusted input and applies safety checks around both filesystem and shell operations.

## Enforced protections

- Dangerous command patterns are blocked by default
- Filesystem writes are scoped to the working directory
- API secrets are redacted from logs and output
- Config files avoid storing sensitive values in plain text

## Future hardening

- provider response validation
- prompt injection isolation
- sandboxed execution contexts
- log rotation and audit trails
