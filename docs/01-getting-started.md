# Getting started

F:ist (**F**ist: **I**nteractive **S**earch **T**ool) is a fast, keyboard-first file browser and launcher for the terminal. The binary is `fs`.

![Main interface](images/01-hero.png)

## Overview

`fs` navigates directories, searches them recursively (`fd`), full-text (`ripgrep`), and through your own visit history — all in one interface, with the same fuzzy filtering and the same undo/redo stack. This page gets you from nothing to your first useful session.

## Install

### Via script (recommended)

```shell
curl -fsSL https://raw.githubusercontent.com/Squirreljetpack/fist/main/install.sh | sh
```

### Via cargo

`cargo install fist` works, but the release binary is the recommended install because it ships with the latest features.

### Dependencies

`fd` and `ripgrep` power the search panes, `bat` renders previews, and `eza` lists directories. Optional preview backends: `chafa` (images), `mediainfo` (metadata), `kreuzberg` (document extraction).

```shell
cargo install fd-find ripgrep bat eza
```

### Shell integration (zsh)

```shell
echo '\neval "$(fs :tool shell)"' >> ~/.zshrc
```

This adds the `z` jump function (type a folder name to `cd` to your best match) and `zz` (jump and open). See [Shell integration](11-shell-integration.md) for the full story, including aliases and widgets.

## Your first session

```shell
fs
```

You're in the **Nav** pane, listing the current directory.

![Nav pane](images/02-nav-pane.png)

- Type to fuzzy-filter the listing. `Esc` clears the query.
- `Enter` accepts the current row: directories `cd` in, files open via [lessfilter](12-lessfilter.md) (the edit preset by default).
- `←` / `→` move to the parent directory / advance into the selection.
- `ctrl-z` / `ctrl-shift-z` undo and redo your navigation.
- `?` previews the current item.

## Core keybindings

The complete list is always available in-app (`alt-h`) or from the shell (`fs :tool show-binds`). These are the ones you'll reach for daily:

| Keys | Action |
| --- | --- |
| `↑` / `↓` | Move the cursor |
| `Enter` | Accept (enter directory / open file) |
| `←` / `→` | Parent directory / advance into the item |
| `ctrl-z` / `ctrl-shift-z` | Undo / Redo pane history |
| `ctrl-f` | **Find** — recursive search (fd) |
| `ctrl-r` | **Search** — full-text search (rg) |
| `ctrl-g` | **History** — visited folders & files |
| `alt-enter` | **Print** the current path (scripting) |
| `tab` | Toggle selection on the current row |
| `ctrl-e` | **Menu** of context-aware actions |
| `ctrl-u` | **Queue** overlay (pending copy/cut operations) |
| `ctrl-x` / `ctrl-c` / `ctrl-v` | Cut / Copy / Paste |
| `delete` / `shift-delete` | Trash / Permanently delete |
| `ctrl-n` / `ctrl-shift-n` | New file / New directory |
| `ctrl-s` | Toggle hidden files |
| `ctrl-d` | Toggle "only directories" |
| `?` | Preview current item |
| `alt-h` | Help overlay |
| `ctrl-esc` | Open a shell in the current directory |

## Command line

The same features are subcommands. In the find pane, the **last** positional argument is the pattern; earlier ones are search roots.

```shell
fs                      # nav pane (directory browser)
fs pattern              # interactive find (fd)
fs path pattern         # find under a path
fs -t d .               # only directories, current tree
fs :open file.pdf       # open files, record history      (alias :o)
fs :rg "TODO" -p src    # full-text search                (alias :)
fs :file                # recent files
fs :dir                 # recent folders
fs :custom              # browse a piped list of paths    (alias :c)
fs :tool                # utilities                       (alias :t)
fs :info                # database stats
```

`fs --help` and per-subcommand help (`fs :rg --help`) document every flag. `fs :tool types` prints the full catalog of `-t` types.

## Next steps

- [Core workflows](02-core-workflows.md) — the everyday loop.
- [Panes](03-panes.md) — what each list view is for.
- [Configuration](10-configuration.md) — make f:ist yours.

## FAQ

**Where do my config and data live?**

Config: `~/.config/fist/`. Database and logs: `~/.local/state/fist/`. Helper scripts: `~/.cache/fist/`.

**Why is the binary called `fs`?**

Fist was designed to sit beside the other two-letter commands (`fd`, `rg`, `ls`). The name is a backronym: **F**ist: **I**nteractive **S**earch **T**ool.

**Does it work in bash/fish?**

The shell integration is zsh-only for now. The interactive app itself is shell-agnostic.

[Next: Core workflows →](02-core-workflows.md)
