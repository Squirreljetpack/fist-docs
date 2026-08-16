# Command line

`fs` is one binary with several command faces. Each face starts a different pane; every one is scriptable via [output & templates](16-output-templates.md), and the interactive TUI is only one of the outputs.

## Overview

| Command | Alias | Starts |
| --- | --- | --- |
| `fs ::` / `fs` | `:fd` | The **find** pane (`fd`) — the default |
| `fs :` | `:rg` | The **search** pane (ripgrep) |
| `fs :dir` | — | Recent folders |
| `fs :file` | — | Recent files |
| `fs :o` | `:open` | Open files and apps |
| `fs :custom` | `:c` | A piped listing or command output |
| `fs :info` | — | Stats and database records |
| `fs :tool` | `:t` | Plugins & utilities — see [Tools](15-tools.md) |

## `fs ::` / `:fd` — find

Browse with `fd`. The last positional is the pattern; earlier ones are search roots:

```shell
fs :: src main.rs          # pattern "main.rs" under src/
fs :: --sort mtime .       # newest first, current directory
fs -t image .              # only image categories
fs -t '*.rs' .             # only .rs files
fs -t d .                  # only directories
fs :: --glob '!vendor/**'  # extra args go to fd after --
fs :: --cd -- .            # print a picked path for `cd` (used by z)
fs :: --list .             # print results, no TUI (see output)
```

Key flags: `--sort` (`name` `mtime` `atime` `size` `none`), visibility (`-h`/`-I`/`-a`/`-F`/`-f`, `-A`), `-t`/`--types` (see [The find pane](05-find-pane.md)), `--transform`, `--cd`, `--list`, `--reset-visibility`.

## `fs :` / `:rg` — search

Full-text search. Patterns are positionals (`-e` in rg terms); roots come from `-p/--path` or **stdin**:

```shell
fs : 'fn main' -p src/      # pattern in a path
find src -type f | fs : todo  # paths via stdin
fs : -i 'todo'               # case-insensitive, current directory
fs : -- -l '*.rs' 'TODOs'    # flags after -- go to ripgrep
fs : --list 'fn main' -p src/   # print matches, no TUI
```

Flags: `-p/--path`, `-i`, `-s`, `-S` (smart case), `-A/-B/-C` context, `-1` (one match per line), `--query`, `--preserve-whitespace`, `--fixed-strings`, `--filtering`, `--rebase`. See [The search pane](06-search-pane.md).

## `fs :dir` and `fs :file` — recents

The history panes, ranked by the [event-clock score](07-history-database.md):

```shell
fs :dir                     # recent folders
fs :dir --sort atime        # most recently visited first
fs :dir keyword             # jump: print the best match (used by z)
fs :file report             # recent files matching "report"
```

Flags: `--sort`, `-l/--list`, `--cd` (`:dir`), `--query` (`:file`).

## `fs :o` / `:open` — open

```shell
fs :o                      # the apps pane — pick a program, open your files
fs :o file.md              # open with the system handler, record history
fs :o -w 'code --add' src  # open with a specific program
```

`-w/--with` runs a program on the given files. Without files (or with an empty `--with`), the **apps pane** opens with your files pending — pick a program there.

## `fs :custom` — piped listings

```shell
git ls-files | fs :custom                # browse git-tracked files
fs :custom 'ls -R ~/pics'                # browse command output
git status --short | fs :custom --transform @my-transform.lua
```

Trailing arguments run as a command; an empty command reads stdin. `--tail-sep` / `--input-sep` set separators, `--transform` maps each row through Lua.

## `fs :info` — stats

| Usage | Output |
| --- | --- |
| `fs :info` | Config and log paths |
| `fs :info files` | Table of entries: name, path, alias, last access, count, score |
| `fs :info --limit 20` | Cap the table |
| `fs :info -m` | Path-only output, shaped by `--format` |

## Global flags

| Flag | Effect |
| --- | --- |
| `--config` / `--mm-config` | Point at different config files |
| `--override <path>` | Declared, but not applied by the current build — use `--config` / `--mm-config` instead. |
| `--dump-config` | Print the resolved configuration |
| `--style` | `icons` `icon-colors` `colors` `none` `all` `auto` |
| `--fullscreen` | Force fullscreen on/off |
| `--lock-prompt` | Lock the query prompt |
| `--alt-accept` | Accept prints instead of opening (scripting) |
| `--opener` | Command for opening picked files |
| `--output-sep` / `--format` | Output shaping — see [Output & templates](16-output-templates.md) |
| `-q` / `-v` | Quieten / increase logging (or `FS_VERBOSITY`) |

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | OK |
| `1` | An error occurred (logged) |
| `22` | No match (e.g. a keyword jump found nothing) |
| `127` | The event loop closed unexpectedly |

## FAQ

**What's the difference between `fs` and `fs ::`?**

None — `fs` with no subcommand is the find pane. `::` is the explicit alias.

**How do I print results without the TUI?**

Use `--list` (see [Output & templates](16-output-templates.md)).

**How do I make accept print a path for scripting?**

`--alt-accept` — accept outputs the path instead of opening it. This is how the `z` shell function works.

[← Previous: Menu actions](13-menu-actions.md) · [Next: Tools (`fs :tool`) →](15-tools.md)
