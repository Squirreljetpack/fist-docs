# Tools

`fs :tool` (alias `:t`) bundles standalone utilities that share f:st's configuration, size engine, database, and preview pipeline.

## The subcommand inventory

Invoke any tool directly as `fs :tool <name> [ARGS]...`, or run bare `fs :tool` with no arguments to open an interactive fuzzy picker over the common tools (`colors`, `liza`, `lessfilter`, `pager`, `bump`, `trash`, `showbinds`, `types`, `diskspace`, `check`, `action`):

| Tool | Alias | Purpose |
| --- | --- | --- |
| `colors` | — | Fullscreen terminal and ratatui palette swatch |
| `liza` | `lz` | Token-driven `eza` wrapper and directory viewer |
| `shell` | — | Shell integration generator (`z`, `x`, `Z`, and widgets) |
| `lessfilter` | `lf` | File dispatcher through [lessfilter](./lessfilter) presets |
| `pager` | `pg` | File, directory, and stdin pager through `bat` into `minus` |
| `bump` | — | CLI editor for the [history database](./history-database) |
| `trash` | — | System trash mover with timed fallback prompts |
| `showbinds` | — | Resolved keybinding and help printer |
| `types` | — | File type and category mapping printer |
| `diskspace` | `ds` | Parallel recursive directory size viewer |
| `check` | — | Validator for TOML config files and menu actions |
| `action` | — | Headless runner for [menu actions](./menu-actions) |

Pass `--help` to any tool (`fs :tool bump --help`) for its full option list.

## colors

`fs :tool colors` renders an interactive showcase of the terminal's 16 ANSI colors, 256-color palette, and text modifiers as seen by ratatui, useful when authoring styles in `config.toml` and `mm.toml`.

## liza

`fs :tool liza` (alias `lz`) wraps `eza` with compact `:token` shorthands for directory previews and shell listings:

```shell
fs :tool liza :u2 -- src/
fs :tool lz ::nav :a
```

Any argument starting with `-` is forwarded directly to `eza` (prefer `-L=4` with `=` when passing valued flags so `liza` does not mistake the value for a path). Positional target paths can be passed directly or after `--`. See [The liza token language](#the-liza-token-language) below for all tokens.

## shell

`fs :tool shell` emits the initialization script for your shell (`--shell=zsh`, `bash`, `fish`, `nu`, or `sh`).

<video controls preload="none" poster="./images/shell.png" src="./images/shell.mp4"></video>

See [Shell integration](./shell-integration) for the generated functions and widgets, and `fs :tool shell --help` for function-naming and keybinding flags.

## lessfilter

`fs :tool lessfilter [PRESET] [PATHS]...` (alias `lf`) runs the [lessfilter](./lessfilter) dispatcher on one or more paths. Pass `--diagnose` to inspect rule scoring without executing commands; see `fs :tool lessfilter --help` for all flags.

## pager

`fs :tool pager [+OFFSET] [--] [FILE]` (alias `pg`) pages a file or standard input through `bat` into `minus`, or delegates directory arguments to `display_directory` in `pager.toml`. See [Pager](./pager) and `fs :tool pager --help`.

## bump

`fs :tool bump` modifies the [history database](./history-database) from scripts or the command line:

<video controls preload="none" poster="./images/history.png" src="./images/history.mp4"></video>

```shell
# Increment visit count for paths by 5
fs :tool bump -c 5 ~/work/harborlight src/main.rs

# Remove a path from the database (-c 0)
fs :tool bump -c 0 ~/old-project

# Bump all dirs matching a glob
fs :tool bump --glob "**/work/*" -- dirs

# Prune missing paths whose score is below 5
fs :tool bump --prune -c 5

# Reset a single table, or delete the entire database
fs :tool bump --reset -- files
fs :tool bump --reset
```

The optional trailing argument after `--` selects a specific table (`dirs`, `files`, or `apps`). See `fs :tool bump --help`.

## trash

`fs :tool trash [OPTIONS] <PATHS>...` moves files and directories to the system trash. When trashing fails on an interactive terminal, it prompts with a timed confirmation to permanently delete (or retry with `sudo rm -rf` on permission denial). Use `-s` / `--follow` (`default`, `recursive`, or `show`) to control whether symlink targets are trashed alongside links. See `fs :tool trash --help` for all flags.

## showbinds

`fs :tool showbinds` loads the built-in keymap, merges your `~/.config/fist/mm.toml` overrides, and prints the complete active binding table alongside action descriptions.

## types

`fs :tool types` prints every file type (`f`, `d`, `l`, `x`, `b`, `c`, `s`, `p`, `e`), every built-in file category and its associated extensions, and any custom `[categories]` groups defined in `~/.config/fist/lessfilter.toml`.

## diskspace

`fs :tool diskspace [OPTIONS] [PATHS]...` (alias `ds`) calculates directory sizes concurrently using the same parallel sizing engine that powers in-app [size sorting](./sorting#size-sorting):

```shell
fs :tool ds
fs :tool ds -d 3 -m 2.5 -b ~/work
fs :tool ds ~/work/a ~/work/b -o ~/work/a/target
```

When given a single input path, `ds` prints a size-sorted tree rooted at that path. When given multiple input paths, `ds` builds a unified skeleton tree rooted at their deepest common ancestor so you can compare branches side by side. See `fs :tool ds --help` for depth, percentage threshold, binary-unit, and output-path flags.

## check

`fs :tool check` parses and validates `config.toml`, `mm.toml`, `lessfilter.toml`, `actions.toml`, and every `*.toml` file under `actions/` (including compiling Lua chunks and checking for duplicate menu labels or reserved queue kind names). It exits `0` when valid and non-zero if any error is found.

## action

`fs :tool action <NAME> [--dest <DIR>] [--] [PATHS]...` runs a configured [menu action](./menu-actions#running-from-the-shell) directly from the command line without launching the TUI.

## The liza token language

`fs :tool liza` translates colon-prefixed tokens into `eza` flags and tree layouts. Multiple single-letter tokens can be combined after a single colon (`:u2`, `:sba`):

| Group | Token | Meaning |
| --- | --- | --- |
| Filters | `:a` | Hidden files included, directories grouped first |
| Filters | `:i` | `--git-ignore` filtering enabled |
| Filters | `:<0-9>` or `:T` | Recursive tree to depth `0`–`9` (or unlimited with `:T`) |
| Columns | `:m` | Modification time column |
| Columns | `:b` | Octal permissions and modification time |
| Columns | `:t` | Timestamp column |
| Columns | `:s` | File size column |
| Columns | `:l` | Long listing (`ls -al` equivalent) |
| Columns | `:x` | Extensive metadata columns |
| Trees | `::nav` | Compact directory navigation tree |
| Trees | `::dirs` | Directory-only tree |
| Trees | `::git` | Git-status annotated tree |
| Views | `::flatten` | Flattened directory contents |
| Views | `::recent` | Most recently modified files |
| Styles | `:u` | Decorated output with icons and colors |
| Styles | `-1` | One entry per line |
| Styles | `:h` | Column headers |
| Styles | `:V` | Print resolved `eza` command before running |

## History and stats: `fs :info`

Called with no table name, `fs :info` prints the active paths to `config.toml`, `mm.toml`, and the log file. Called with a table name (`dirs`, `files`, or `apps`), it prints the recorded rows and their frecency scores:

<video controls preload="none" poster="./images/info.png" src="./images/info.mp4"></video>

```shell
fs :info
fs :info dirs --sort=frecency --limit=20
fs :info files --minimal --format='{=}'
```

Pass `--minimal` to omit table borders and print raw or `--format`-formatted paths; see `fs :info --help` for sorting and limit flags.

Next: [Command line](./command-line) · [lessfilter](./lessfilter) · [Output templates](./output-templates)
