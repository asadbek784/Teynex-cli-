# TYNEX CLI Architecture

TYNEX is composed of a thin CLI shell, a safety layer, a project scanner, a planning loop, and execution tools.

## Layers

- CLI Layer: argument parsing, interactive mode, non-interactive mode
- UI Layer: banner, doctor report, status output, plan display
- Agent Layer: planning and autonomous execution loop
- Tool Layer: filesystem access and process execution
- Project Layer: repository and stack detection
- Config & Security: configuration hierarchy and command validation

## Key design choices

- Keep core logic isolated from provider implementations
- Validate shell commands before they run
- Restrict filesystem writes to the working project root
- Favor standard library features before adding dependencies
- Allow future extension via simple interfaces and modules
