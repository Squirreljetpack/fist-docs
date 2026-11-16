# Custom pane

The Custom pane (`fs :custom`) turns any command or standard-input stream into a live f:st pane with two-column rows, Lua row transformations, previews, sorting, and full file operations.

## Invocation

Run `fs :custom` (alias `:c`) with a command to execute, or with no command to read records from standard input:

```shell
fs :custom git status --porcelain
git ls-files | fs :custom
```

- **`--input-sep <CHAR>` (alias `--is`)** — character that separates records in the input stream (defaults to newline `\n` / `\r\n`).
- **`--tail-sep <CHAR>` (alias `--ts`)** — character that splits each record into a path and a second-column tail.
- **`--transform <LUA>`** — inline Lua chunk or `@file.lua` script that rewrites or filters each record.
- **`--sort <ORDER>` and `--cd`** — set the initial sort order (`name`, `mtime`, `atime`, `size`, `none`), or enable `--cd` so accepting prints the chosen path and exits.
- **`--no-store`** — disable in-memory caching so reloading or returning to the pane re-runs the command from scratch.

If no command is given and standard input is an interactive terminal, `fs :custom` exits immediately with an error. See `fs :custom --help` for all flags.

## The record format

Incoming bytes are parsed into rows in three steps:

1. **Record splitting** — the stream is split on `--input-sep` (or line breaks by default). Empty records are skipped.
2. **Field splitting** — if `--tail-sep` is set, each record is split on the **first** occurrence of that character into `(path, tail)`. When `--tail-sep` is omitted or absent from a record, the entire record is `path` and `tail` is `""`.
3. **Path resolution** — relative paths are resolved against the pane's working directory (`~` is expanded).

For NUL-delimited producers (`find -print0`, `git status -z`), pass `--input-sep=$'\0'`.

## Transforming rows with Lua

Passing `--transform <LUA>` compiles a Lua 5.4 chunk once and calls it for every record with `(path, tail)` passed via `...`:

```lua
local path, tail = ...
return path, display, tail
```

The chunk returns up to three values:

| Position | Name | Effect |
| --- | --- | --- |
| 1 | `path` (`string` or `nil`) | Filesystem path used by previews and actions; returning `nil` drops the row |
| 2 | `display` (`string` or `nil`) | Custom text rendered in column 1 (`nil` or `""` keeps normal styled path display) |
| 3 | `tail` (`string` or `nil`) | Text rendered in column 2 (`nil` keeps the incoming `tail` from `--tail-sep`; `""` clears it) |

Prefix the argument with `@` (`--transform @~/.config/fist/transforms/notes.lua`) to load the script from a file. The exact same `--transform` contract is also supported on `fs ::` (`fs --transform <LUA>`) where incoming `tail` is `""`.

A transform that fails to compile at startup leaves the pane untransformed; a transform that raises a runtime error stops stream ingestion at that row.

## The second column

The tail string populates column 2 of the results table:

- **Filtering with `%`** — typing `%` in the prompt scopes the text after `%` to column 2, letting you filter by category, git status badge, or annotation while text before `%` filters column 1.
- **`display` overrides** — when `--transform` returns a non-empty `display` string, column 1 renders `display` (and uses it for fuzzy matching and alphabetical sorting) while previews, editors, and file operations continue to act on the underlying `path`.
- **Sort metadata** — when a hard sort (`mtime`, `atime`, `size`) is engaged and a row's tail is empty, column 2 displays the formatted sort value instead.

## A markdown notes manager

Combining a shell producer, `--tail-sep`, and `--transform` turns a folder of Markdown files into a categorized notes browser:

<video controls preload="none" poster="./images/custom.png" src="./images/custom.mp4"></video>

```shell
cd ~/vault
fs -i -t .md --list --format '{=}\t{-1.}' . |
  fs :custom --tail-sep $'\t' --transform '
local path, vault = ...
local rel = ("/" .. path):match("^.-/" .. vault:gsub("%W", "%%%1") .. "/(.*)") or path
rel = rel:gsub("%.md$", "")
return path, rel, rel:match("^(.-)/") or ""
'
```

- `fs -i -t .md --list --format '{=}\t{-1.}' .` emits each note's path, a tab, and the vault's folder name.
- `--transform` strips the vault prefix and `.md` extension for `display` in column 1 and returns the note's top-level folder for column 2, so `% Prog` filters to `Programming`.
- Inside the pane, typing fuzzy-matches note paths, pressing `right` (`Advance`) opens the note in `$EDITOR`, `ctrl-x` / `ctrl-v` moves notes between folders, and a custom [menu action](./menu-actions) can prompt for a title and create a new note in the current project.

## The usual pane operations

Because every row resolves to a real filesystem path, standard navigation, file operations, menu actions (`alt-e`), previews, selections, stashing, and queued transfers work identically to the Nav and Find panes.

## Reload and streaming

By default, `fs :custom` caches streamed rows in memory once the producer finishes (`stored`):

- **Command-backed panes** replay their cached rows instantly when you return to them via `Undo`. Pressing the reload bind (`alt-r`) re-runs the command to pick up fresh output.
- **Stdin-backed panes** retain their cached rows across `Undo` / `Redo` stack transitions, but cannot re-read a closed pipe.
- **`--no-store`** disables the in-memory row cache so command-backed panes re-execute their command on every stack revisit or reload instead of holding rows in memory.
