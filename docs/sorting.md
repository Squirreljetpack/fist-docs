# Sorting

Every pane orders its rows by a **sort order** — one of five: `name`, `mtime`, `atime`, `size`, or `none` (insertion order). Sorting is per-pane state, set from the options overlay or per command.

## The sort orders

| Order | Meaning | Availability |
| --- | --- | --- |
| `name` | Path, lexically | All panes |
| `mtime` | Modification time | Filesystem panes; newest first |
| `atime` | Access time | Filesystem panes |
| `size` | File size | Filesystem panes; loads metadata lazily in the background |
| `none` | Insertion order (e.g. fd/rg output order) | All panes |

## Setting the sort

| Way | How |
| --- | --- |
| Options overlay | `ctrl-p` — visibility, sort order, and (in Search) context |
| Per command | `--sort <order>` on `fs`, `fs ::`, `fs :`, `fs :custom` |
| Per pane default | `[panes.*] default_sort` — see below |

In the History/Apps panes, the options overlay's sort keys `n` / `t` / `c` / `f` cycle `name` / `atime` / `count` / `frecency` (the database orderings); `ctrl-d` cycles the sort instead of toggling directories.

## Defaults

Which sort a fresh pane starts with comes from two layers:

- **Code default** — with no configuration, Nav panes come up sorted by **mtime**; other filesystem panes default to `none`.
- **Shipped config** (`config.toml`) — overrides some of these, e.g. `[panes.search] default_sort = "none"` (see [Configuration](configuration.md)).

## `apply_default_sort`

New panes start at their pane's default sort, and when `apply_default_sort` (`[panes.settings]` in config, default `true`) is set, switching to a pane re-applies that pane's default sort. Turn it off to keep whatever sort you last used when you switch away and back.

## Per-pane notes

- **Find**: `name`, `mtime`, `atime`, `size`, `none`. `size` needs metadata, which loads lazily, so the first sort may populate progressively.
- **Search**: `name`, `mtime`, `atime`, `none` — **size is not available** and an inherited `size` sort drops to `none` rather than erroring. Sorting is translated to rg flags (`--sort=path`, `--sortr=modified|accessed`); in filter mode, sorting is fuzzy-filter (nucleo) side with a stability threshold, so live results don't thrash.
- **Files / Folders** (History): the database rank (`frecency`) is the default order; `n` / `t` / `c` / `f` switch to name / atime / count / frecency. See [History & the database](history-database.md).
- **Apps**: database orderings, like the history panes.
- **Custom / Stash**: any of the five orders.

## FAQ

**Why is my Nav pane sorted by mtime?**

It's the default for `[panes.nav] default_sort`; change it in `config.toml` (see [Configuration](configuration.md)).

**Why does my Search pane ignore `--sort size`?**

The rg backend can't order matches by size; the sort falls back to `none` (match order).
