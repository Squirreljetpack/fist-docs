# Shell integration

`fs :tool shell` prints shell initialization code: a **`z`** jump function (type a folder name, `cd` to your best match), **`x`** (jump and navigate in f:st), **`zz`** (jump and open), directory hooks that feed the history database, and three line-editing **widgets** that browse with f:ist right in your prompt.

Supports **Zsh**, **Bash** (4.3+), **Fish**, **Nushell**, and standard **POSIX** shells (`sh`, `dash`, `ash`, `ksh`).

![Shell integration](images/11-shell.png)

## Overview

- `z` jumps: existing directories `cd` directly; keywords resolve through the history database or an interactive picker.
- `x` jumps and opens the interactive nav pane to continue navigating.
- `zz` jumps *and* opens — the file version of `z`.
- The directory hook bumps `$PWD` into the database on every `cd`, which is what makes `z` smarter over time.
- Widgets bind `shift-←` / `shift-→` / `shift-↓` to interactive pickers that insert paths into the command line.

## Install

### Zsh / Bash
```shell
eval "$(fs :tool shell)"
```

### Fish
```fish
fs :tool shell --shell=fish | source
```

### Nushell
```nushell
# 1. Generate the script once in your terminal:
fs :tool shell --shell=nu --aliases | save -f ~/.config/nushell/fist.nu

# 2. Add to your config.nu ($nu.config-path):
source ~/.config/nushell/fist.nu
```

### POSIX (`sh`, `dash`, `ash`, `ksh`)
```shell
eval "$(fs :tool shell --shell=posix)"
```

## `z` — jump

```shell
z docs          # cd to the best "docs" match from history
z ~/code        # direct cd — the arg is an existing directory
z .             # interactive: pick a directory under the current one
z ./            # interactive: browse the current directory (all files)
z               # interactive: recent-folders picker
```

The last argument decides the behavior:

| Trailing arg | Command run | Result |
| --- | --- | --- |
| an existing directory | — | `cd` directly |
| `.` or `..` | `fs :: -F --style=colors --cd -- …` | Interactive picker of directories (find pane, dirs only) |
| `./` | `fs :: -a --cd -- …` | Nav pane at the current directory |
| anything else | `fs :dir --sort atime --style=colors --lock-prompt=false --cd -- …` | Best match from the database, printed + `cd`; no match falls back to the interactive `fs :dir` picker |

The picked path is printed by f:ist (`alt-accept` prints instead of opening) and piped back into `cd`.

## `x` — navigate

```shell
x docs          # jump to the best "docs" match and open f:ist nav pane
x ~/code        # navigate ~/code directly in the nav pane
x               # navigate the current directory in the nav pane
```

Within the shell, this is probably about as useful as z. This is just a simple wrapper around z:
- called with no arguments, it starts f:st on your current directory.
- otherwise, it jumps with z, and starts you in the resulting directory.

Like z, this is also a shell function, so accepting any result drops you in its directory.

## `zz` — jump and open

```shell
zz report.md    # open the file (lessfilter edit preset)
zz notes        # jump to the best "notes" match, then open it
zz              # bump the current dir and open it
```

The open command is `fs :tool lessfilter edit` by default — point it at a file (via `paths`), and the preset picks the program (`$EDITOR` for text, etc.). Widgets and the `--opener` flag use the same command.

## Feeding the database

Every directory you `cd` into is recorded in the history database (a `chpwd` hook runs `fs :tool bump "$PWD"` for you). Combined with the event-clock scoring (see [History & the database](history-database.md)), the folders you visit regularly become the fastest to jump to.

## Widgets

Three line-editing widgets run f:ist from the prompt and insert the result into the current line:

| Bind | Behavior |
| --- | --- |
| `shift-←` | Browse a directory to `cd` into — or a file, inserting its name for you |
| `shift-→` | Pick a file and append it (quoted) to the current line |
| `shift-↓` | Full-text search and append the matching lines |

Each widget leaves the prompt alone until you pick something; the inserted paths are shell-quoted.

## `--aliases`

`fs :tool shell --aliases` appends a block of convenience wrappers:

```shell
l  file          # fs :tool lessfilter display   — rich terminal preview
la file          # fs :tool lessfilter extended
ll file          # fs :tool lessfilter info      — metadata
n  file          # edit via lessfilter edit ($EDITOR fallback: nano)
o  files…        # fs :o — open with the system handler, record history
zf               # fs :file --sort atime --lock-prompt=false — recent files
lessfilter / lz / tra   # direct wrappers for the :tool subcommands
```

## Customizing the output

Every embedded default is a flag on `fs :tool shell`:

| Flag | Default | Meaning |
| --- | --- | --- |
| `--z-name` | `z` | Jump function name |
| `--z-dot-args` | `-F --style=colors` | Args for the `.`/`..` picker |
| `--z-slash-args` | `-a` | Args for the `./` picker |
| `--z-dir-args` | `--sort atime --style=colors --lock-prompt=false` | Args for the keyword jump |
| `--nav-name` | `x` | Nav function name |
| `--open-name` | `zz` | Open function name |
| `--open-cmd` | `fs :tool lessfilter edit` | Open command (`{}` = the picked path) |
| `--file-open-cmd` / `--rg-open-cmd` | `--open-cmd` | Per-widget open commands |
| `--dir-widget-bind` / `--file-widget-bind` / `--rg-widget-bind` | `⇧+←` / `⇧+→` / `⇧+↓` | Widget key sequences (resolves to shell-specific escape defaults) |
| `--dir-widget-args` / `--file-widget-args` / `--rg-widget-args` | see Widgets | Per-widget picker args |
| `--aliases` | `false` | Append the alias block |
| `--shell` | auto | Filter the output for this shell tag |

The `FS_INITIAL_INPUT` environment variable pre-fills the keyword picker's query — the `x` function uses it to pass your typed keywords through.

## FAQ

**Which shells are supported?**

Full integration (including line-editor widgets, directory hooks, and aliases) is supported in **Zsh**, **Bash** (4.3+), **Fish**, and **Nushell**. Standard **POSIX** shells (`sh`, `dash`, `ash`, `ksh`) support the core `z`, `x`, and `zz` jump functions and aliases.

**Does `z` work without the database?**

Yes — existing directories `cd` directly, and the `.`/`./` pickers use `fd`, not history.

**Can I use a different opener than `lessfilter edit`?**

`--open-cmd 'code --add {}'` or `--file-open-cmd` / `--rg-open-cmd` for the widgets.
