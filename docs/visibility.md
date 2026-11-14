# Visibility

Visibility controls which filesystem entries enter a pane's listing: hidden dotfiles, git-ignored files, files versus directories, and symlink traversal.

## The visibility model

Six flags govern visibility in directory-walking panes (Nav, Find, and Search):

| Flag | Effect |
| --- | --- |
| `hidden` | Dotfiles (`.` prefix) |
| `hidden-only` | Dotfiles only |
| `ignored` | Paths matched by `.gitignore`, `.ignore`, or `.fdignore` |
| `all` (`unrestricted`) | All entries (`hidden` + `ignored` + bypass `ignore_patterns`) |
| `dirs` / `files` | Directories only or regular files only |
| `no-follow` | Symlinked directories skipped during traversal |

`all` overrides `hidden`, `ignored`, and `[panes.nav] ignore_patterns`.

## Command-line flags

Every visibility dimension has a positive and negative CLI flag pair, accepted both in interactive runs and with `--list`. Run `fs --help` for the full flag list:

| Enable | Disable | Dimension |
| --- | --- | --- |
| `-h`, `--hidden` | `-H`, `--no-hidden` | Hidden dotfiles |
| `-i`, `--no-ignore` | `-I`, `--ignore` | Git-ignored files |
| `-u`, `--unrestricted` | `-U`, `--no-unrestricted` | Unrestricted (`all`) |
| `-F`, `--dirs` | `-f`, `--files` | Directories only vs files only |

## The options overlay

Pressing `alt-p` opens the Options overlay, whose left **Filter** column lists the interactive visibility toggles:

<video controls preload="none" poster="./images/filters.png" src="./images/filters.mp4"></video>

| Row | Shortcut in overlay | Toggles |
| --- | --- | --- |
| `hidden-only` | `o` | Only hidden entries |
| `hidden` | `h` | Hidden dotfiles |
| `ignored` | `i` | Git-ignored entries |
| `Dirs` | `d` | Directories only |
| `Files` | `f` | Files only |
| `all` | `a` | Unrestricted (`hidden` + `ignored`) |

Active filters are highlighted in the column.

## Runtime binds

Two bind actions adjust visibility directly from any pane without opening the Options overlay, emitting a footer toast on every change:

- **`ToggleFilter(filter)`** — `ctrl-s` is bound to `ToggleFilter(hidden)` by default, toggling dotfiles on and off.
- **`CycleFilter`** — `ctrl-d` cycles filetype visibility in the order **all types → directories only → files only → all types** (in History panes, `ctrl-d` toggles the sort order instead).

## Smart visibility

The `[smart_visibility]` table in [config.toml](./configuration#smart-visibility) adapts filters automatically based on context so you rarely need to toggle flags by hand:

- **Dot-prefixed queries (`dot_query_show_hidden = true`, `dot_query_show_ignored = false`)** — typing a query that begins with `.` in the Find pane automatically enables `hidden` (and `ignored` when configured) for the duration of that query.
- **Empty folders (`empty_folders = true`)** — when a Nav directory would look completely blank under the active filters but contains hidden entries on disk, f:st reveals those hidden entries automatically and displays a notice toast.
- **Git-aware defaults (`git_repo = "auto"`)** — inside a git work tree, default visibility shows hidden dotfiles (such as `.github/` and `.env.example`) and hides git-ignored build artifacts; outside a git repository, it hides dotfiles and shows ignored files. Setting `git_repo = "always"` re-evaluates this rule whenever you cross a repository boundary during navigation; `"never"` disables git detection.
- **Explicit ignored targets (`ignored_targets = true`)** — if you invoke `fs` on a target path that is itself git-ignored (such as `fs target/debug`), f:st enables `ignored` automatically so the listing is not empty.
- **Retaining filetype filters (`retain_filetype_filters = false`)** — by default, switching into a Nav pane clears `dirs` / `files` filters so you see the full directory; set `true` to keep them across directory transitions.

## Per-pane defaults

Nav, Find, and Search each accept a `default_visibility` table under `[panes.<name>]` in [config.toml](./configuration#panes):

```toml
[panes.nav]
default_visibility = { hidden = true, ignore = false }
ignore_patterns = ["node_modules", "__pycache__"]
```

- **`[panes.nav] ignore_patterns`** applies gitignore-style globs relative to the listed directory whenever `all` visibility is off.
- **Inheritance across pane switches** — switching between Nav, Find, and Search carries over manual visibility changes made during the session unless overridden by the target pane's configuration.
- **Database and stream panes** — `Files`, `Folders`, `Apps`, `Stash`, and `Custom` panes do not walk the filesystem: they have no `default_visibility` setting and omit the Filter column from the Options overlay.
