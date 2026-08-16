# Output & templates

When you don't want the TUI — scripting, piping, shell functions — f:ist prints results instead. `--list` selects the output mode; `--format` shapes each line; `--output-sep` joins multiple results.

## Overview

- `--list` prints the pane's contents and exits — one path per line by default.
- `--format` is a template applied to every printed path.
- `--output-sep` sets the separator between results (default: newline).

## `--list` mode

```shell
fs :: --list .                # everything under the current directory
fs :: --list -t image .       # only images
fs : 'fn main' -p src/ --list # search matches
fs :dir -l                    # recent folders (bare -l = all)
fs :dir -l all                # every folder, including missing ones
fs --list .                   # the nav pane
```

Supported by the find pane (`fs :: --list`), the nav pane (`fs --list`), the search pane (`fs : --list`), and recent folders (`fs :dir -l`). Flags combine as usual — `-t`, `-F`/`-f`, `--sort`, etc.

## The `--format` template

The template is applied per path. `{}` is the whole path; `{s:e}` with a delimiter slices it into components:

| Template | `/home/you/docs/report.md` |
| --- | --- |
| `{}` | `'/home/you/docs/report.md'` — full path, single-quoted (quotes escaped) |
| `{0=0}` | `/home/you/docs/report.md` — full path, raw |
| `{0:-1}` | `/home/you/docs` — everything but the last component |
| `{-1:0}` | `report.md` — just the last component |
| `{1:3}` | `home/you` — a middle slice |

Details:

- The delimiter chooses quoting: `:` quotes the slice, `=` emits it raw, `.` slices the **current directory** instead of the path.
- Indices are 0-based; **negative** counts from the end; **`0` as the end** means "to the end".
- Non-numeric specs (`{a}`, `{name}`) are left literal — the templates are indexes, not names.
- Backslash escapes the next character (e.g. `\{`).

## `--output-sep`

Multiple results are joined with the separator (default newline):

```shell
fs :: --list -t f --output-sep ' ' .   # space-separated file names
```

## Scripting pattern

The typical shell loop:

```shell
while IFS= read -r f; do
  echo "handling $f"
done < <(fs :: --list --format '{0=0}' .)
```

Use `--format '{0=0}'` for unquoted absolute paths. For interactive pickers in scripts, `--alt-accept` makes accept print instead of open (this is how the `z` shell function gets its results).

## FAQ

**What's the difference between `--list` and `-l`?**

The same mode — `:dir` uses `-l` (`--list`), the panes use `--list`.

**Why is my path quoted?**

`{}` quotes by design — safe for shell interpolation. Use `{0=0}` when you need the plain path.

**Why does `{a}` print literally?**

Templates use numeric component indexes, not names. `{0=0}` is the full path; see the table above.

[← Previous: Tools (`fs :tool`)](15-tools.md)
