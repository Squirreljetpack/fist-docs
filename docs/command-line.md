# Command line

The `fs` binary uses colon-prefixed subcommands (`::`, `:`, `:custom`, `:dir`, `:file`, `:open`, `:info`, `:tool`) so subcommand names never collide with file paths or search queries passed on the command line.

## Invocation shapes

You can invoke `fs` in three shapes:

```shell
# 1. Bare fs: opens the Nav pane in the current directory
fs

# 2. Bare fs with arguments or flags: opens the Find pane
fs src/ auth
fs -t .rs

# 3. Colon subcommand: opens the named pane or tool
fs : "fn main"
fs :dir work
fs :tool check
```

Where the query sits depends on the subcommand:

- In `fs` / `fs ::`, the **last** positional argument is the query and any earlier positional arguments are search paths (`fs [PATHS]... [PATTERN]`).
- In `fs :` (`:rg`), **every** positional argument is a search pattern (`-p` / `--path` specifies search paths).
- In `fs :dir`, trailing positional arguments form the history keyword query; in `fs :file`, `--query <TEXT>` sets the initial query.

## The subcommand map

| Subcommand | Aliases | Opens or runs |
| --- | --- | --- |
| *(none)*, `:fd` | `::` | [Nav pane](./panes#built-in-panes) when given no search arguments; [Find pane](./find-pane) otherwise |
| `:rg` | `:` | [Search pane](./search-pane) (full-text search) |
| `:custom` | `:c` | [Custom pane](./custom-pane) (command stdout or piped stdin) |
| `:dir` | — | [Folders history pane](./history-database#history-panes) |
| `:file` | — | [Files history pane](./history-database#history-panes) |
| `:open` | `:o` | [App pane](./app) when given no files, or opens given files directly |
| `:info` | — | Prints config/log paths or dumps history database tables |
| `:tool` | `:t` | Runs a built-in utility subtool; bare `fs :tool` opens an interactive tool picker |

Run `fs --help` or `fs <subcommand> --help` for the complete flag reference of each subcommand.

## Finding and searching

- **`fs :: [PATHS]... [PATTERN] [-- FD_ARGS]`** — searches paths recursively. Narrow results by file type, extension, or category with `-t` (`-t f`, `-t .rs`, `-t image`), transform rows with `--transform <LUA>`, or start a query with `.` to reveal dotfiles automatically. See [Find pane](./find-pane).
- **`fs : [PATTERNS]... [-- RG_ARGS]`** — searches file contents. Restrict target paths with `-p` / `--path`, set case sensitivity (`-S` smart, `-s` sensitive, `-c` ignore) and context (`-A`, `-B`, `-C`), toggle one-line vs stacked matches with `--one-line` (`-1`), switch to literal matching with `--fixed-strings`, keep spaces in a single pattern with `--preserve-whitespace`, rebase the working directory to the common parent with `--rebase`, or start in filter mode with `--filtering`. See [Search pane](./search-pane).

## Streams and stdin

Two subcommands read from standard input when piped:

- **`fs :custom [CMD]...`** — when `[CMD]...` is omitted, `:custom` reads records from standard input (and exits with an error if stdin is a TTY). Split records and tails with `--input-sep` (`--is`) and `--tail-sep` (`--ts`), rewrite or filter rows with `--transform`, or pass `--no-store` to skip caching rows in memory. See [Custom pane](./custom-pane).
- **`fs :`** — when standard input is piped and `--no-read` is not passed, `:rg` reads newline-delimited file paths from stdin, filters them through the active visibility rules, and searches inside those files. Pass `--no-read` to ignore piped stdin.

## History-driven invocation

`:dir` and `:file` query `record.db` directly:

```shell
fs :dir --cd harborlight
fs :file --query=config --cd
```

- **Queries** — `:dir` takes trailing positional keywords (`fs :dir foo bar`), while `:file` takes `--query <STRING>`. Both also accept the hidden `--initial-input` flag used by the shell integration to seed the prompt when falling back to the TUI.
- **`--sort` and `--list`** — sort results by `frecency` (`none`), `atime`, `count` (`size`), `name`, or `mtime`, or pass `--list` (`-l`) to print matching database paths without opening the TUI.
- **`--cd`** — resolves the query before starting the UI: if a match is found, `fs` bumps it in the database and either prints the path to stdout or opens it via `--opener`, falling through to the interactive pane only when `[history] refind = "Search"` and no match (or only the current directory) is found.

## Global options

Global flags apply across subcommands (see `fs --help` for the complete list):

- **`--config` / `--mm-config`** — override the paths to `config.toml` and `mm.toml`.
- **`--dump-config`** — writes default config files into `~/.config/fist` on a TTY, or prints resolved `config.toml` when piped.
- **`--alt-accept`** — swaps the open (`enter`) and print (`alt-enter`) accept bindings.
- **`-q` / `-v`** — decrease or increase verbosity relative to `FS_VERBOSITY` (default level `4`).
- **`--style`, `--fullscreen`, `--lock-prompt`** — per-run overrides for icon/color mode, layout sizing, and prompt locking.

## Output and printing

When accepting rows in print mode (`alt-enter` by default, or `enter` with `--alt-accept` / `--cd`) or listing with `--list`:

- **`--output-sep <SEP>` (alias `--os`)** — string printed after each result (default `\n`; supports C escapes such as `\0` and `\t`).
- **`--format <TEMPLATE>`** — [output template](./output-templates) expanded once per printed row (`{=}`, `{-1=0}`, `{t}`).
- **`--opener <PROG>`** — program used to open accepted rows instead of the system default opener. Prefix the program with `!` (`--opener="!mpv"`) to spawn the opener detached so it survives `fs` exiting.
- **Single-print rules** — by default, accepting in print mode prints every selected row; setting `[interface] no_multi_print = true` in `config.toml` (or running `fs :open` with no file arguments) prints only the cursor row.

## Visibility and list modes

The shared visibility flags (`-h` / `-H` hidden, `-i` / `-I` ignored, `-u` / `-U` unrestricted, `-F` dirs only, `-f` files only) work identically in interactive panes and with `--list`; see [Visibility](./visibility).

`--list` (`-l`) runs non-interactively and streams matching paths to standard output:

- On `fs` / `fs ::`, `fs :`, `fs :open`, `--list` prints the matched paths and exits.
- On `fs :dir` and `fs :file`, `-l` / `--list` optionally takes `all` (`-l all`) to include database entries whose paths no longer exist on disk.
- `--cd` and `--list` are mutually exclusive and return a flag-conflict error if combined: `--cd` resolves a single best match (with interactive fallback), whereas `--list` streams all matches to stdout.

## Help, exit codes, files on disk

Pass `--help` to `fs`, any `:subcommand`, or any `fs :tool <name>` to view its flags.

`fs` uses four exit codes:

| Exit code | Meaning |
| --- | --- |
| `0` | Success (item accepted, command completed, or `--help` / `--version`) |
| `1` | General runtime, configuration, or command error |
| `22` | No match found in `--cd` mode (when `verbosity >= 1` and `refind != "Search"`) |
| `127` | Interactive interface closed without accepting (`esc` / `ctrl-c`) |

Files on disk follow platform conventions (with `~/.config/fist` preferred on all platforms when it already exists):

| Location | Default path (Linux) | Contents |
| --- | --- | --- |
| Config directory | `~/.config/fist` | `config.toml`, `mm.toml`, `lessfilter.toml`, `pager.toml`, `actions.toml`, `actions/` |
| State directory | `~/.local/state/fist` | `record.db` (`dev.db` in debug builds), `fist.log`, `tools.log` |
| Cache directory | `~/.cache/fist` | Cached data and optional shell init script |
| Temp directory | `$TMPDIR/fist/<pid>-<nanos>` | Per-process archive extractions and converted application icons (cleaned on exit) |

Next: [Tools](./tools) · [Output templates](./output-templates) · [Shell integration](./shell-integration)
