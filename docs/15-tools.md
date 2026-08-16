# Tools (`fs :tool`)

`fs :tool` (alias `:t`) is the toolbox: listing, previews, database maintenance, validation, and shell setup. Each tool is documented in full where it belongs — this page is the map.

## Overview

| Tool | Alias | Purpose | See |
| --- | --- | --- | --- |
| `shell` | — | Print shell integration | [Shell integration](11-shell-integration.md) |
| `lessfilter` | `lf` | Run a preview/edit preset on files | [Previewing with lessfilter](12-lessfilter.md) |
| `liza` | `lz` | eza-style directory listing with f:ist's colors | below |
| `pager` | `pg` | Render text through the pager | below |
| `colors` | — | Interactive color reference | below |
| `types` | — | Print file types and categories | below |
| `bump` | — | Maintain the history database | below |
| `trash` | — | Trash files, follow symlink chains | below |
| `diskspace` | `ds` | Directory size trees | below |
| `show-binds` | — | Print the resolved keybindings | below |
| `check` | — | Validate configs and action scripts | below |

## `liza` — directory listings

An eza-style listing that reuses f:ist's colors and icons — what lessfilter's **Directory** action renders:

```shell
fs :tool liza .            # the current directory
fs :tool liza :u .         # pretty view
fs :tool liza :l .         # cleaner ls -al
fs :tool liza ::nav .      # pretty tree view (paged)
```

Positional arguments starting with `:` select the view (`:a` all, `:u` pretty, `:l` detailed columns, `::nav` tree, …); everything else passes through to eza. `lz` is the alias; the shell integration adds a bare `lz` function.

## `pager` — text rendering

Render text through the pager (used by lessfilter's Text action):

```shell
fs :tool pager README.md
echo hello | fs :tool pager
```

Override the pager with `FS_PAGER` (e.g. `FS_PAGER=moar`).

## `colors` — the color reference

Renders an interactive swatch table of every named color (requires a terminal):

```shell
fs :tool colors
```

## `types` — types and categories

Print everything `-t` understands:

```shell
fs :tool types        # file types (f d l b c x e s p) and categories
```

## `bump` — the history database

```shell
fs :tool bump "$PWD"              # record a visit
fs :tool bump --count 3 file.md   # weight it
fs :tool bump --prune             # drop missing entries below the threshold
fs :tool bump --reset files       # reset a table (or the whole db)
fs :tool bump --glob '*.log'      # bump everything matching a glob
```

The shell integration calls `bump` on every `cd` — see [History & the database](07-history-database.md) for what gets recorded and when.

## `trash` — safe deletion

```shell
fs :tool trash file.md              # move to the system trash
fs :tool trash --force x            # delete when the trash backend fails
fs :tool trash --follow Show link   # inspect a symlink chain
fs :tool trash --follow Recursive link  # remove the chain to its end
```

`--quiet` suppresses prompts, `--abort` stops at the first failure.

## `diskspace` — directory sizes

```shell
fs :tool ds .                # a full size tree
fs :tool ds a b c            # a tree rooted at their common ancestor
```

`-d`/`-F`/`-m` shape the tree per branch.

## `show-binds` — resolved keybindings

Prints the effective keybindings: shipped defaults, your `mm.toml` `[binds]`, and the matchmaker builtins, as one list. See [Configuration](10-configuration.md).

## `check` — validate everything

```shell
fs :tool check
```

Parses `config.toml`, `mm.toml`, `lessfilter.toml`, `actions.toml` and the `actions/` folder, validates every keybinding, and compiles every menu-action Lua script. Exits non-zero on errors — run it after editing config or actions.

## FAQ

**Where do the tools log?**

`fist.tools.log`, next to the main log — see [History & the database](07-history-database.md) for paths.

**Why is `colors` silent when piped?**

It draws its swatches with the terminal UI; it needs a real terminal.

**How do I add more tools?**

The `:tool` subcommands are the built-in set. For your own commands, write [menu actions](13-menu-actions.md) or shell functions — they compose with the same output formats.

[← Previous: Command line](14-command-line.md) · [Next: Output & templates →](16-output-templates.md)
