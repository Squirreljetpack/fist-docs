# Lua scripting

Menu actions — and the actions you bind to keys in `mm.toml` — are written in Lua. f:ist runs each one in an isolated VM with the targeted paths and destination passed in, plus a small set of helper globals for toasts and progress feedback.

> f:ist uses two separate Lua environments. This page covers the **menu-action execution VM**. Pane `--transform` scripts run in a different, shared VM — see [The custom pane](custom-pane.md#the---transform--hook).

## How a script runs

An action's `command` is a Lua chunk. It runs once per invocation — or once per row for queued `Queue` / `QueueBatch` actions — inside a fresh, isolated VM, so nothing leaks between executions. The chunk receives its arguments both as function arguments `(...)` and as globals.

### Arguments

| Global | Value |
| --- | --- |
| `paths` | Table of targeted absolute paths (strings). |
| `dst` | The destination string — empty for a direct menu call; the queue row's destination for queued runs. |
| `nav_cwd` | The Nav pane directory (injected when present). |

### Global functions

| Function | Effect |
| --- | --- |
| `toast(style, msg)` | Show a footer toast. `style` accepts `"info"`, `"success"`, `"warning"` (`"warn"`), `"error"` (`"err"`), `"normal"` (`nil`). |
| `toast_push(style, prefix, item)` | Append an item to a grouped toast list with a styled prefix (e.g. `toast_push("success", "Compressed: ", "archive.zip")`). |
| `set_progress(0-255)` | Update the executing queue item's progress bar (0–255 scale). |
| `os.exit(code)` | Stop the script at the given exit code without terminating the host `fs` process. |
| `error(...)` | Raise a runtime error, stopping execution and displaying a failure toast. |

### Loading scripts from files

Prefix a `command` with `@` to load the chunk from a file (`~/` and absolute paths work; relative paths resolve against the actions folder).

## Binding the same Lua to keys

The action key you define can also be bound directly in `mm.toml` (`"ctrl-x" = "MenuAction(my-action)"`) or enqueued via `ExecuteQueue(my-action)` — the same Lua runs. See [Menu actions](menu-actions.md) and [mm.toml](mm.toml.md).

## Validation

`fs :tool check` parses every menu-action script and validates its Lua, failing non-zero on errors.
