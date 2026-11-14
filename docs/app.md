# App pane

The App pane lists installed desktop applications with icon previews and frecency ranking, launching your chosen program against any staged pending files.

<video controls preload="none" poster="./images/apps.png" src="./images/apps.mp4"></video>

## Opening the App pane

You can open the App pane from the command line or from inside any pane:

```shell
# Open the App pane with no pending files
fs :open

# Open files directly with the system opener
fs :open photo.png notes.md
```

- **`fs :open` (alias `:o`)** — with no file arguments, opens the App pane interactively. Passing one or more file paths opens them directly with the system default opener (or `--opener <PROG>`). Pass `-o` / `--simple-ui` to restrict bindings to core navigation, selection, accept/quit, preview, and query editing.
- **Menu → `open with` (`W`)** — inside any pane, pressing `alt-e` and choosing `open with` switches to the App pane with the selected rows (or the cursor row) preloaded into the pending-files list.
- **`App` bind action** — switches to the App pane with an empty pending-files list.

Pressing `ctrl-z` (`Undo`) backs out to the pane you opened the App pane from.

## Application discovery and ranking

f:st discovers desktop launchers for the current platform and caches them in the `apps` table of the [history database](./history-database):

- **Linux** — scans `/usr/share/applications`, `~/.local/share/applications`, and `~/Desktop` (up to depth 2) for `.desktop` entries with `Type=Application`, `NoDisplay` unset or `false`, and non-empty `Name` and `Exec` keys.
- **macOS** — scans `~/Applications`, `/Applications`, `/System/Applications`, `/System/Library/CoreServices`, and `/System/Volumes/Preboot/Cryptexes/App/System/Applications` for `.app` bundles.

On the first open in a session, f:st populates the pane from `record.db` immediately while rescanning application directories in the background and reloading if new entries are found. Like History panes, the App pane uses SQL sort orders (`frecency`, `atime`, `count`, `name`, `mtime`) in the Options overlay (`alt-p`) or via `ctrl-d` / `ctrl-s`, and omits filesystem visibility filters.

## Pending files

Pressing `alt-u` inside the App pane opens the pending-files overlay (`To open:`) instead of the shared transfer queue:

- **Inspecting and editing** — view all file paths staged to be passed to the chosen application, edit a path in place, reorder rows (`shift-up` / `shift-down`), or remove entries (`delete` / `backspace`).
- **Accepting an application** — pressing `enter` on an application row exits `fs`, launches that application detached with all pending files as arguments, and bumps the application's frecency score in `record.db`.

## Previews and configuration

In the preview pane, `lessfilter` runs the `Application` built-in action to resolve and render the highlighted application's icon (falling back to `liza :u2` when no icon is found).

Configure App pane defaults under `[panes.app]` in [config.toml](./configuration#other-panes):

| Key | Default | Meaning |
| --- | --- | --- |
| `require_icon` | `true` on macOS, `false` elsewhere | Only list applications with a resolvable icon |
| `app_scan_directories` | `[]` | Extra directories scanned for desktop applications |

Common pane keys (`prompt`, `prompt_style`, `show_preview`, `lock_prompt`, `preview_layout_index`) also apply. Styling for the `To open:` overlay lives under `[app]` in [mm.toml](./mm.toml#queue-and-app-views).
