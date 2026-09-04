# Providers

TYNEX supports a provider-agnostic configuration model. The default configuration is intentionally simple and can be extended later to OpenAI-compatible, Anthropic-compatible, Gemini, and OpenRouter endpoints.

## Current runtime behavior

- Configuration is stored in a JSON file
- Provider/model values are loaded from config or environment variables
- Secrets are redacted before printing
- The architecture is ready for future provider adapters
