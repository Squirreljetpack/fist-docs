# Search pane

The Search pane searches file contents across a directory tree, pairs each matched file path with its surrounding line context, and switches on the fly between live full-text querying and in-memory fuzzy filtering.

## Invocation

Launch the Search pane from the command line or from inside any pane:

```shell
fs : [PATTERNS]...
fs :rg -p src -p tests TODO
```

- **Subcommand (`fs :` or `fs :rg`)** — starts a full-text search with any positional `[PATTERNS]...`.
- **In-app (`ctrl-r`)** — opens the Search pane rooted at the current working directory. If rows are selected in the current pane when you press `ctrl-r`, the search is scoped strictly to those selected paths.
- **Target paths and stdin (`-p` / `--path`, `--rebase`, `--no-read`)** — pass one or more `-p <PATH>` flags to restrict the search roots, or pipe newline-delimited file paths into `fs :` on standard input (pass `--no-read` to ignore piped stdin). Passing `--rebase` shifts the pane's working directory to the deepest common parent of all target paths.
- **Starting in filter mode (`--filtering`)** — opens the pane directly in filter mode rather than query mode; pair with `--query <TEXT>` to seed the initial filter string.
- **Output and sorting (`--list`, `--cd`, `--sort`)** — `--list` (`-l`) prints matching file paths to stdout without opening the TUI, `--cd` prints the accepted path on exit, and `--sort` orders matches by `name`, `mtime`, `atime`, or `none`. See `fs : --help` for all flags.

## Two columns

The Search pane populates column 1 with the file path and column 2 (the tail) with the matched line text and syntax/match highlights. Two layout modes control how multiple matches inside the same file appear:

- **One-line mode (`--one-line` / `-1`, or `one_line = true`)** — every matched line is its own row, with the file path in column 1 and the single match line (or sliding context window when `-A`/`-B`/`-C` is used) in column 2.
- **Stacked context mode (`--one-line=false`, or `one_line = false`)** — all matches within a single file are grouped into one row, rendering the file path on top and the stacked match blocks underneath separated by a horizontal rule.

Set your preferred default via `one_line` under `[panes.search]` in [config.toml](./configuration#search).

## Query mode and filter mode

Pressing `ctrl-r` inside the Search pane toggles between **query mode** (live full-text search) and **filter mode** (in-memory fuzzy narrowing of current matches):

<video controls preload="none" poster="./images/search.png" src="./images/search.mp4"></video>

In filter mode, typing `%` splits the filter so text before `%` matches the file path in column 1 and text after `%` fuzzy-matches the line content in column 2 (`src/api % Bearer`).

## Patterns and quoting

In query mode, the prompt text can express multiple OR-combined patterns at once:

- **Whitespace splitting** — unquoted spaces split the query into separate patterns (`fn struct` matches lines containing either `fn` or `struct`).
- **Single quotes** — wrap a phrase in single quotes (`'fn main'`) to keep spaces inside a single pattern; escape a literal single quote inside or outside quotes as `\'`.
- **`preserve_whitespace`** — passing `--preserve-whitespace` or setting `preserve_whitespace = true` in `[panes.search]` automatically prepends a leading `'` to the prompt so spaces stay in one pattern without manual quoting.
- **Regex vs literal filter** — query mode evaluates patterns as regular expressions by default, whereas filter mode always performs literal fuzzy matching.

## Regex versus fixed strings

- **Fixed strings (`--fixed-strings` / `--no-fixed-strings`)** — treats query-mode patterns as literal strings instead of regular expressions. Press `ctrl-s` inside the Search pane (or set `fixed_strings = true` in `[panes.search]`) to toggle between `regex` and `fixed` at runtime.
- **Case sensitivity (`-S` smart, `-s` sensitive, `-c` ignore)** — defaults to smart case; press `ctrl-d` inside the Search pane to cycle `smart → sensitive → ignore`.
- **Context lines (`-A`, `-B`, `-C`)** — include trailing, leading, or surrounding lines around each match.
- **`empty_pattern`** — when the query bar is empty in query mode, `[panes.search] empty_pattern` provides the fallback pattern (shipped config uses `"-v ^ *$"`, where the leading `-v ` inverts matching so every non-blank line is listed; omitting `empty_pattern` leaves the pane blank until you type).

## Visibility, ignores and iglobs

The Search pane honors the shared [visibility flags](./visibility) (`hidden`, `ignored`, `all`, `follow`) and `-t` filetype filters, pruning VCS directories (`.git`, `.jj`, `.hg`, `.svn`) automatically unless `all` (`-u`) is active.

In addition, `[panes.search.iglobs]` in [config.toml](./configuration#search) defines directory-scoped case-insensitive globs:

```toml
[panes.search.iglobs]
"" = ["!*.lock", "!*.min.js"]
"~/work/harborlight" = ["!fixtures/**"]
```

Globs under `""` apply to every search; globs keyed by a directory path (`~` is supported) apply when searching from that directory. Enabling `all` visibility (`-u`) bypasses `iglobs`.

## Configuration

`[panes.search]` in [config.toml](./configuration#search) configures the pane's defaults:

| Key | Default | Effect |
| --- | --- | --- |
| `one_line` | `false` (`true` in `--dump-config`) | One row per match line vs stacked per-file blocks |
| `fixed_strings` | `false` | Literal patterns instead of regular expressions |
| `preserve_whitespace` | `false` | Keep whitespace in a single pattern without quoting |
| `empty_pattern` | none (`"-v ^ *$"` in `--dump-config`) | Pattern run when the query is empty |
| `iglobs` | `{}` | Folder-keyed glob rules |
| `rg_status_template` | `""` | Status line template in query mode |
| `fs_status_template` | `""` | Status line template in filter mode |

The common pane keys (`prompt`, `prompt_style`, `show_preview`, `lock_prompt`, `preview_layout_index`, `default_visibility`, `default_sort`) also apply.

## Sorting

The Search pane supports `none` (parallel stream order), `name` (alphabetical by path), `mtime`, and `atime`. There is no `size` sort because rows represent individual line matches rather than whole files or directories; passing `--sort size` returns an error, and entering the Search pane from a size-sorted pane resets the sort to `none`.

## Status line templates

Because the prompt only displays one mode's text at a time, `[panes.search]` provides two matchmaker display templates that show the *other* mode's active input in place of `{}`:

- **`rg_status_template`** — rendered while in **query mode**, with `{}` replaced by the saved fuzzy filter string.
- **`fs_status_template`** — rendered while in **filter mode**, with `{}` replaced by the active search patterns.

## Acting on a match

Every search row records the 1-based line and column of the match (`HIGHLIGHT_LINE` and `HIGHLIGHT_COLUMN`):

- **Preview** — the preview pane automatically centers its viewport on `HIGHLIGHT_LINE` and highlights the matched line via `bat --highlight-line`.
- **Advancing or accepting** — pressing `right` (`Advance`) or `enter` exports `HIGHLIGHT_LINE` and `HIGHLIGHT_COLUMN` to `[interface] advance_command` and the [lessfilter](./lessfilter) `edit` preset, which translates them into native line-and-column jump arguments (`+line:col`, `+line,col`, `file:line:col`) for `nvim`, `vim`, `hx`, `kak`, `nano`, `emacs`, `zed`, `code`, and `subl`.
