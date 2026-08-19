# The search pane (`rg`)

The **Search** pane runs full-text search through `ripgrep`. Every result is an ordinary pane row, with a second **context column** showing the matching lines.

![Search pane](images/06-search.png)

## Overview

- **Query mode** re-runs ripgrep as you type; **filter mode** narrows already-loaded results.
- `%` switches the filter to the context column.
- Advancing on a match exports `HIGHLIGHT_LINE` / `HIGHLIGHT_COLUMN`, so editors open at the exact match.

## Opening a search

| Way | Command |
| --- | --- |
| In-app | `ctrl-r` |
| Subcommand | `fs :rg` (alias `:`) |
| With args | `fs :rg "pattern" -p path1 -p path2` |

```shell
fs :rg "TODO" -p src                    # pattern + paths
fs :rg -i -C 2 "error" .                # case-insensitive, 2 lines of context
fs :rg -- --glob '!vendor/**' "fix"     # anything after `--` goes to rg raw
echo -e "src\nlib" | fs :rg "foo"       # paths can come from stdin
```

## Query and filter mode

Toggled with `ctrl-r`:

**Query mode** — your input is the *pattern*. Every change re-runs ripgrep, streaming results in. Multiple whitespace-separated queries are OR'd; wrap a query containing spaces in single quotes, escape a literal quote as `\'`.

**Filter mode** — results are *already loaded*; your input is a fuzzy nucleo filter over them. Instant, no re-search.

The two modes keep separate inputs; the inactive one is shown in the status line (`rg_status_template` / `fs_status_template`).

Tip: start in query mode to search the tree, then `ctrl-r` into filter mode to drill down through thousands of matches.

### Filtering the context column

The filter targets the **path** column by default. Prefix the query with `%` to filter the **context** column instead:

```text
path_filter % context_filter
```

`%` (percent + space) selects the context column, `%_` the path column. Queries are regexes in query mode, literal matches in filter mode.

## Flags

| Flag | Meaning |
| --- | --- |
| `-i` / `-s` / `-S` | Ignore case / case-sensitive / smart case |
| `-A n` / `-B n` / `-C n` | Context lines after / before / both sides |
| `--one-line`, `-1` | One line per match (`--no-heading`) |
| `--fixed-strings` / `--no-fixed-strings` | Literal patterns (default: regex) |
| `--preserve-whitespace` | Prefix the query with `'` so it isn't split |
| `--rebase` | Run rg from the deepest common directory of the given paths |
| `--filtering` | Start in filter mode |
| `--no-read` | Don't read paths from stdin |
| `--sort <sort>` | `name` `mtime` `atime` `none` (size is not available) |

In-app, the same knobs live in the options overlay (`ctrl-p`): context before/after, case, one-line, regex/fixed, and sort.

## What rg actually runs

F:ist builds a deterministic rg command: `--line-number --column --heading|--no-heading --null` plus visibility flags, patterns as repeated `-e` arguments, paths at the end. `--color=ansi` and `--trim` come from `[rg] base_args`; `--sortr=modified|accessed` / `--sort=path` handle sorting.

- Arguments after `--` are appended last and override internal flags.
- `-v` (invert match) is detected from extra args; results lose column info so the context column still makes sense.
- `[rg] empty_pattern` (default `-v ^ *$`) runs when the query is empty — everything except blank lines.

Not supported through the wrapper (use `--` to pass them raw): `--pre` / `--pre-glob`, `-z` zip search, `--count-matches`, `--passthru`, `--multiline`.

## Opening at the match

When you **advance** on a single-line search hit, f:ist exports:

| Variable | Meaning |
| --- | --- |
| `HIGHLIGHT_LINE` | Line number of the match |
| `HIGHLIGHT_COLUMN` | Byte column (when non-zero) |

The lessfilter **edit** preset consumes these and opens the file at the right spot when your editor is supported (`micro`, `vim`, `nvim`, `nano`); other editors get plain paths. The same variables let the previewer jump to the matching line.

## Sorting and stability

The search pane sorts by `name`, `mtime`, `atime`, or `none` (match order — the default); `size` is not available here (see [Sorting](sorting.md#per-pane-notes)). Sort options translate to rg flags (`--sort=path`, `--sortr=modified|accessed`). In filter mode, sorting is nucleo-side with a stability threshold so live results don't thrash.

## Status templates

While searching, the status line shows the active mode and input. Shipped defaults:

```toml
[panes.search]
rg_status_template = '{blue:filter: {}} \s\m/\t'   # shown in query mode
fs_status_template = '{red:query: {}} \s\m/\t'     # shown in filter mode
```

`{}` is replaced with the active input. Both are text templates with style directives.

## FAQ

**What's the difference between query mode and filter mode?**

Query mode searches the tree (re-runs ripgrep); filter mode narrows the results already loaded. `ctrl-r` toggles.

**How do I search for a phrase with spaces?**

Single quotes in query mode: `'search this'`.

**How do I exclude files?**

Pass rg flags raw: `fs :rg -- --glob '!vendor/**' pattern`.
