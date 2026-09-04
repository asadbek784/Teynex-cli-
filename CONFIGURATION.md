# Configuration

TYNEX reads settings in this order:

1. CLI arguments
2. environment variables
3. project config (`.tynex/config.json`)
4. user config (`~/.tynex/config.json`)
5. defaults

## Environment variables

- `TYNEX_PROVIDER`
- `TYNEX_MODEL`
- `TYNEX_API_KEY`
- `TYNEX_BASE_URL`
- `TYNEX_CONTEXT_LIMIT`
- `TYNEX_THEME`
- `TYNEX_AUTO_APPROVE`
- `TYNEX_NO_COLOR`

## Notes

- API keys are never logged.
- Secrets are redacted in output.
- Project configuration should avoid persisting secrets unless encrypted.
