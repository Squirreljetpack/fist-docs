# Shell integration

`fs :tool shell` generates shell functions, directory-change hooks, and line-editor widgets that connect your interactive shell to f:st's history database and panes.

## Supported shells and installing

f:st generates native integration scripts for Zsh, Bash 4.3+, Fish, Nushell, and POSIX shells (`sh`, `dash`, `ash`, `ksh`). Try the integration in your current session by evaluating the output directly, then add the line to your startup file:

```shell
# Zsh (~/.zshrc)
eval "$(fs :tool shell --shell=zsh)"

# Bash (~/.bashrc)
eval "$(fs :tool shell --shell=bash)"

# POSIX shells (~/.profile)
eval "$(fs :tool shell --shell=sh)"
```

```fish
# Fish (~/.config/fish/config.fish)
fs :tool shell --shell=fish | source
```

```nushell
# Nushell: save the generated module and source it in $nu.config-path
fs :tool shell --shell=nu | save -f ~/.config/nushell/fist.nu
source ~/.config/nushell/fist.nu
```

Always pass your actual shell via `--shell` (`zsh`, `bash`, `fish`, `nu`, or `sh`) rather than relying on `$SHELL` detection so subshells and non-login shells receive the right syntax. For faster shell startup, cache the output of `fs :tool shell --shell=<shell>` to a file and `source` it directly, regenerating the file whenever you upgrade `fs`. To remove the integration, delete the startup line and open a new shell.

## The jump function

`z` replaces `cd` with frecency-ranked jumps backed by f:st's unified [history database](./history-database). How `z` resolves its arguments depends on the shape of the query:

| Invocation | Behavior |
| --- | --- |
| `z /existing/dir` | Single argument is an existing directory on disk: `cd` directly |
| `z` | No arguments: open the Folders history pane interactively |
| `z <terms> .` | Trailing `.`: find the best history match for `<terms>` and open a recursive Find pane (`-t d`) rooted there |
| `z <terms> ./` | Trailing `./`: find the best history match for `<terms>` and open the Nav pane rooted there |
| `z <terms>` | Plain query: `cd` directly to the highest-scoring history match |

Each branch has its own default flags on `fs :tool shell` (`--z-no-args`, `--z-dot-args`, `--z-slash-args`, `--z-default-args`); run `fs :tool shell --help` for the flag names.

When a plain query has no match in the database—or when the top match is already your current directory—`[history] refind` in [config.toml](./configuration) decides what happens next:

- `"Next"` (default) skips the current directory and jumps to the next-best match, or opens the interactive Folders pane if no match exists.
- `"Search"` opens the interactive Folders pane seeded with your query.
- `"None"` returns the current directory or exits with status `22` when no match exists.

## The nav function

`x` is a shorthand for `z <terms> ./` that opens the Nav pane inside the best matching directory from history (or the current directory when called with no arguments):

```shell
x
x src
```

<video controls preload="none" poster="./images/nav.png" src="./images/nav.mp4"></video>

If a previous interactive `z` or `x` run was cancelled, re-running `x` with no arguments seeds the prompt from `FS_INITIAL_INPUT`.

## The open function

`Z` searches the Files history table and opens the selected row through the [lessfilter](./lessfilter) `edit` preset (`fs :tool lessfilter edit`). Adding a trailing `.` switches the search to the Folders history table instead:

```shell
Z config
Z work .
```

Override the opener command passed to `fs :tool shell` with `--open-cmd`, or change the function name with `--open-name` (and its flags with `--open-args`).

## Line-editor widgets

In Zsh, Bash, Fish, and Nushell, `fs :tool shell` binds three interactive widgets that launch `fs` on `/dev/tty` and insert or act on the result without clearing your current command line:

| Widget | Default key | Command | Effect on accept |
| --- | --- | --- | --- |
| Directory search | `shift-left` | `fs -F` | `cd` into the selected directory (or append file path if you accept a file) |
| File search | `shift-right` | `fs` | Append shell-quoted file path(s) to the command line |
| Full-text search | `shift-down` | `fs :` | Open `$EDITOR` at the matched line and column (`alt-enter` appends the path instead) |

<video controls preload="none" poster="./images/shell.png" src="./images/shell.mp4"></video>

Multi-selecting rows with `tab` before accepting in the file search widget pushes every selected path onto the command line, shell-quoted and separated by spaces. In the full-text search widget, `enter` / `right` opens the matched file at `HIGHLIGHT_LINE` and `HIGHLIGHT_COLUMN` via the `edit` preset and returns to your shell prompt when the editor exits, while `alt-enter` prints the matched path into the command line buffer.

Override any widget's keybinding, flags, or disable it completely by passing an empty bind string to `fs :tool shell`:

```shell
eval "$(fs :tool shell --shell=zsh --dir-widget-bind='^T' --rg-widget-bind='')"
```

See `fs :tool shell --help` for the full set of `--dir-widget-*`, `--file-widget-*`, and `--rg-widget-*` flags. Pressing `esc` or `ctrl-c` inside a widget leaves the command line untouched.

## History recording hooks

The integration installs a directory-change hook (`chpwd_functions` in Zsh, `PROMPT_COMMAND` in Bash, `--on-variable PWD` in Fish, `env_change.PWD` in Nushell, and a `cd` wrapper in POSIX shells) that runs `fs :tool bump "$PWD" dirs` in the background whenever your working directory changes. Because both shell navigation and in-app navigation bump the same SQLite database, directories you `cd` into in the shell immediately rank in `ctrl-g`, and directories you enter inside `fs` immediately rank in `z`.

Paths matching `[history] exclude` or outside `[history] base_dir` in [config.toml](./configuration) are ignored by the hook.

## Aliases and environment assumptions

Passing `--aliases` to `fs :tool shell` defines convenience wrappers around subcommands and [lessfilter presets](./lessfilter#presets):

| Alias | Expansion |
| --- | --- |
| `lz` | `fs :tool liza` (eza directory listing wrapper) |
| `l` | `fs :tool lessfilter display` |
| `la` | `fs :tool lessfilter extended` |
| `ll` | `fs :tool lessfilter info` |
| `n` | `fs :tool lessfilter edit` |
| `o` | `fs :open` |

With both `--aliases` and `--cd`, it also defines `c` (interactive `fs --cd`), `cf` (`fs :file --cd`), and `cdi` (`fs :dir --cd`).

Environment variables read by the shell integration and `fs`:

| Variable | Meaning |
| --- | --- |
| `FS_VERBOSITY` | Default log and toast verbosity (`quiet`, `normal`, `verbose`, `debug`) |
| `FS_INITIAL_INPUT` | Initial query string when `--initial-input` is active |
| `FS_EDITOR`, `FS_VISUAL`, `EDITOR` | Editor command resolved by the `edit` preset and `proc.editor` |

## Conflicts and workarounds

- **fzf keybinding overlap** — when `fzf` is configured with `shift-left`, `shift-right`, or `shift-down`, load `fs :tool shell` after `fzf` or pass custom `--dir-widget-bind`, `--file-widget-bind`, and `--rg-widget-bind` flags.
- **Existing `z`, `Z`, or `x` commands** — rename any of the generated functions with `--z-name`, `--open-name`, and `--nav-name` (for example, `fs :tool shell --z-name=j --nav-name=jj`).
- **POSIX shells** — `sh`, `dash`, `ash`, and `ksh` lack a programmable line-editor widget API, so `--shell=sh` installs `z`, `x`, `Z`, and the `cd` hook without keybindings.

Next: [History database](./history-database) · [Command line](./command-line) · [Tools](./tools)
