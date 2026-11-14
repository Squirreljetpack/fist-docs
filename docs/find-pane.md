# Find pane

The Find pane recursively lists files and directories under one or more search roots and lets you fuzzy-filter, sort, preview, and act on the results as they stream in.

## Invocation

You can enter the Find pane from the command line or from inside any pane:

```shell
fs :: [PATHS]... [PATTERN]
fs [PATHS]... <PATTERN>
```

- **Subcommand (`fs ::` or `fs :fd`)** — opens the Find pane directly. Calling bare `fs` with any positional arguments, `-t` filters, or visibility flags also opens the Find pane.
- **In-app (`ctrl-f`)** — switches from any pane into the Find pane rooted at the current working directory. Pressing `ctrl-f` while already in the Find pane reloads the search in place.
- **Positional arguments** — when multiple positional arguments are given, every argument before the last is a search path and the final argument is the initial query (`fs :: src tests auth` searches `src/` and `tests/` with query `auth`).
- **`--cd` and `--list`** — passing `--cd` resolves leading arguments against the [history database](./history-database) to pick the search root and prints the accepted path on exit; passing `-l` / `--list` streams matching paths directly to standard output without opening the TUI. See `fs :: --help` for all flags.

## Where it differs from fd

The Find pane reads as f:st's recursive file search rather than a thin command-line wrapper:

- **Trailing query** — the last positional argument is the query and earlier arguments are search paths, matching `grep` and `fs :` rather than `fd`.
- **Smart dot-queries** — starting a query with a leading `.` (such as `.env` or `.github`) automatically reveals hidden files via [smart visibility](./visibility#smart-visibility).
- **Extended `-t` flag** — `-t` accepts not only filesystem entry types, but also file extensions, built-in file categories, and user-defined MIME categories from `lessfilter.toml`.

## Filetype arguments

The `-t` / `--types` flag accepts a comma-separated list of filters (`fs -t .rs,.toml` or `fs -t image,video`). Each token is matched in priority order:

| Kind | Syntax | Examples |
| --- | --- | --- |
| File types | Single letter or name | `f` (`file`), `d` (`directory`), `l` (`symlink`), `x` (`executable`), `e` (`empty`), `s` (`socket`), `p` (`pipe`), `b` (`block-device`), `c` (`char-device`) |
| Extensions | Leading dot | `.rs`, `.md`, `.tar.gz` |
| Preset categories | Category name or short alias | `image` (`i`, `img`), `video` (`v`, `vid`), `audio` (`a`, `aud`), `document` (`doc`), `compressed` (`z`, `zip`), `source` (`src`, `code`), `configuration` (`conf`, `cfg`), `markdown` (`md`) |
| Custom categories | Key from `[categories]` in `lessfilter.toml` | Any user-defined MIME group name |
| Empty extension | Empty token (`""`) | `-t ""` (files without an extension) |

Run `fs :tool types` to inspect the complete list of built-in and custom categories and the extensions they expand to.

Because single-letter file types take precedence over category aliases, `b`, `l`, `s`, and `x` always select `block-device`, `symlink`, `socket`, and `executable`; spell out `build`, `lossless`, `src` (or `code`), and `exe` when targeting those categories. Passing only `d` (`-t d`) automatically sets directory-only visibility; passing any non-directory type sets file-only visibility.

## Configuration

`[panes.find]` in [config.toml](./configuration#find) shapes how the Find pane populates and renders:

```toml
[panes.find]
prompt_style = { fg = "LightBlue" }
show_preview = 60
lock_prompt = "auto"
reduce_paths = false
exclusions = [".cache"]
max_refresh_items_threshold = 20000
max_refresh_execution_time_threshold = 400
```

- **`exclusions`** — glob patterns omitted from every search unless unrestricted (`all`) visibility is active. Leading `~` expands to your home directory.
- **`reduce_paths`** — when `false` (default), passing multiple search paths anchors the pane's working directory to the first path; when `true`, the working directory becomes the deepest common ancestor of all given paths.
- **`prompt`, `prompt_style`, `lock_prompt`, `show_preview`, `preview_layout_index`** — control the query bar appearance, automatic prompt locking (`"auto"` locks while the query is non-empty), and initial preview layout.

## Visibility, ignoring and VCS pruning

The Find pane shares f:st's [visibility model](./visibility):

- By default inside a git repository, hidden dotfiles are included and `.gitignore` rules are respected; outside a git repository, dotfiles are hidden.
- Version-control metadata directories (`.git`, `.jj`, `.sl`, `.hg`, `.svn`, `.bzr`, `_darcs`, `.pijul`, `CVS`) are pruned automatically whenever ignore filtering is active, even when hidden files are shown.
- Enabling `all` (`-u` on the CLI or `all` in `alt-p`) reveals hidden files, git-ignored files, `[panes.find] exclusions`, and VCS directories together.

## Depth and symlinks

The Find pane always walks the full directory tree recursively from its search roots; f:st does not define a separate depth option of its own (use the [Nav pane](./panes#built-in-panes) for single-level directory listings).

Symbolic links are followed by default during recursive traversal. You can disable symlink traversal for a run with `--no-follow`, toggle `Follow` in the Options overlay (`alt-p`), or set `default_visibility = { follow = false }` under `[panes.find]`.

## Auto-refresh

While the initial search is running, filesystem watching is paused. Once the search finishes, f:st attaches a recursive filesystem watcher only if **both** thresholds in `[panes.find]` are met:

- The total number of rows is below `max_refresh_items_threshold` (default `20000`).
- The search completed within `max_refresh_execution_time_threshold` (default `400` ms).

When either threshold is exceeded, automatic watching stays off so disk activity in a huge tree does not trigger expensive background re-crawls; you can still reload manually at any time.

## Working with results

<video controls preload="none" poster="./images/find.png" src="./images/find.mp4"></video>

Once results stream into the table, every standard pane operation is available:

- **Fuzzy re-filtering** — typing in the prompt narrows the streamed paths in memory; typing `%` matches the remainder of the query against the second column (sort values or Lua transform tails).
- **Sorting and filter cycling** — press `alt-p` to sort by `name`, `mtime`, `atime`, or `size`, `ctrl-s` to toggle hidden files, or `ctrl-d` to cycle all / directories-only / files-only.
- **Previews, selections, and actions** — mark rows with `tab`, enqueue copies or moves with `ctrl-c` / `ctrl-x`, run contextual [menu actions](./menu-actions) with `alt-e`, or press `right` (`Advance`) to enter a directory or open a file in your editor.
- **Row transforms (`--transform`)** — passing `--transform <LUA>` on `fs ::` runs a Lua chunk on every found path to filter rows, rewrite display names, or populate the tail column; see [Transforming rows with Lua](./custom-pane#transforming-rows-with-lua).
- **Missing `fd`** — if the `fd` binary is not installed on `PATH`, the pane stays empty and surfaces a startup error toast.

Next: [Search pane](./search-pane) · [Visibility](./visibility) · [Sorting](./sorting)
