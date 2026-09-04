# Tools

TYNEX exposes a small but extensible tool set.

## Filesystem

- `listDirectory(path)`
- `readFile(path)`
- `writeFile(path, content, root)`
- `searchText(root, query)`

## Shell

- `runCommand(command, cwd, allowDangerous)`

The shell layer assigns risk to commands and blocks dangerous actions by default.
