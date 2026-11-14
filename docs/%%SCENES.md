# Clip & Doc Alignment Audit (`%%SCENES.md`)

Audit of all 30 scenes in [`clip.sh`](file:///home/archr/gh/_fzs/fist/%%CLIPS/tools/clip.sh) against the exact prose of all 47 media placements in `docs/*.md`, verified against the rendered posters and video durations.

---

## 0. Vetted Decisions

Decisions confirmed by the user for the upcoming `clip.sh` + `docs/*.md` pass:

- **`nav-pane`:** Keep as a video and expand with actions — `left` to enter parent, then `up` until reaching the prompt (`getting-started.md`, `panes.md` if kept, or `getting-started.md`).
- **`options`:** Keep `options.mp4` as-is (no changes needed).
- **`tools.md`:** Remove all three TUI clips (`shell.mp4`, `history.mp4`, `info.mp4`); keep `tools.md` text-only.
- **`fileops.mp4`, `action.mp4`, `compress.mp4`:**
  - Move `fileops.mp4` from `mm.toml.md#binds` to `panes.md` (overlays section).
  - Move `action.mp4` from `menu-actions.md#examples` to `panes.md` / `mm.toml.md#menu`.
  - Move `compress.mp4` from `menu-actions.md#strategies` to `menu-actions.md#examples`.
- **`queue-edit` → `queue-complete` + new `queue-edit`:**
  - Rename current `queue-edit` to `queue-complete` and move it to `queue.md#clearing-completed-rows`.
  - Film a new `queue-edit` using `f2` (`To`) and `alt-e` (`Source`) for `queue.md#editing-rows`.
- **New clips & cleanups:**
  - Film `stash-workflow` for `stash-panes.md#cross-directory-workflows` (replacing `compress.mp4`).
  - Film `extract` for `queue.md#extraction-rows` (replacing `archive.mp4`).
  - Film/extract a still (`cwd-prompt.png`) for `output-templates.md#the-cwd-prompt-template` instead of `prompt.mp4`.
  - Expand `find` (`find-pane.md#working-with-results`) with working-with-results actions (`ctrl-d`, `tab`, `ctrl-s`).
  - Remove `splash.png` from `command-line.md` and delete unused `custom-stream-directory-preview.png` / `custom-stream-new-note.png` from `docs/images/`.
- **Additional doc adjustments (applied):**
  - Added [`app.md`](file:///home/archr/gh/_fzs/fist-docs/docs/app.md) (hosting `apps.mp4`) and registered it in `.vitepress/config.mts`, `index.md`, `panes.md`, and `command-line.md`.
  - Removed all `assets/help/*.txt` links (`panes.md`, `queue.md`).
  - Removed `Powered by fd` / `ripgrep` phrasing (`panes.md`, `find-pane.md`, `search-pane.md`).
  - Restructured `panes.md`: `App pane` label, single `## Built-in panes` subsection with no images, abbreviated `## Overlays` section (`options.mp4`, `queue.mp4`, `fileops.mp4`), and removed `Status line, footer, and toasts`, `Styles`, and `Mouse`.
  - Removed `shell.mp4`, `history.mp4`, and `info.mp4` from `tools.md`; removed `splash.png` from `command-line.md`; moved `action.mp4` to `mm.toml.md#menu` and `compress.mp4` to `menu-actions.md#examples`.
  - Deleted unused `custom-stream-directory-preview.png` and `custom-stream-new-note.png` from `docs/images/`.

- **Remaining `clip.sh` + post-film doc work:** **Done.**
  - Fixed `long-copy` (`bulk.bin` progress gauge), `undo-jump` (`2024-05-08-standup.md` pasted back into `data/`), and `nav` (`x src`, browse subdir, clean `Escape`).
  - Expanded `nav-pane` (`Left` + `Up` to prompt), `apps` (`alt+u` pending files), `find` (`ctrl-d`, `tab`, `ctrl-s`), `search` (`%`), and `undo` (`alt+z` Redo).
  - Renamed `queue-edit` → `queue-complete` (`queue.md#clearing-completed-rows`), and filmed new `queue-edit` (`F2` `To` + `alt-e` `Source` under `queue.md#editing-rows`), `stash-workflow` (`stash-panes.md#cross-directory-workflows`), `extract` (`queue.md#extraction-rows`), and `cwd-prompt.png` still (`output-templates.md#the-cwd-prompt-template`).
  - Synced all clips and posters into `docs/images/` (`npm run sync-clips`) and verified `npm run build`.

---

## 1. Broken or Defective Recordings in `clip.sh`

These scenes do not show what `clip.sh` intends (verified in the rendered frames/posters):

1. **`long-copy.mp4` (9.1s) — copies `release-notes.pdf` (3.4 KB) instead of `bulk.bin` (2 GiB)**
   - In [`setup.sh`](file:///home/archr/gh/_fzs/fist/%%CLIPS/tools/setup.sh#L237-L261), `release-notes.pdf` is created *after* `bulk.bin`, so under `mtime` sort `release-notes.pdf` is row 0 in `data/`.
   - `clip.sh` presses `ctrl+c` immediately without filtering, so `long-copy.png` shows `Complete: release-notes.pdf (3.4 KB)` instead of a live progress gauge on `bulk.bin`.
   - **Fix:** Add `text:bulk sleep:0.3` before `ctrl+c`, and set `POSTER_AT` mid-transfer while the gauge is filling.

2. **`undo-jump.mp4` (10.5s) — fails with `No items queued.`**
   - `clip.sh` jumps via `ctrl+g` to `vault/` (Nav pane, single-level: `inbox/`, `meetings/`, `projects/`), then types `text:sta` expecting `quick-capture.md` or a standup note, which are inside subdirectories (`inbox/`, `meetings/`). Nothing matches, `ctrl+c` queues nothing, and `undo-jump.png` ends on `No items queued.` after `ctrl+v`.
   - **Fix:** Enter `inbox/` (`text:inb Right`) before `text:quick ctrl+c` (or open Find with `ctrl+f` inside `vault/`).

3. **`nav.mp4` (17.1s) — ends with `Move: mod.rs` instead of exiting an editor**
   - After `x src` → Find → `api` → `Options` sort, `Right` on `mod.rs` does not leave the TUI in `nano` when `ctrl+x` arrives, so `ctrl+x` hits `fs` itself and triggers `Move: mod.rs` (visible in `nav.png`).
   - Also spends ~15s on Find/Options/Move rather than demonstrating `x` (`shell-integration.md#the-nav-function`).
   - **Fix:** Refilm cleanly around `x` (see §3).

4. **`nav-pane.mp4` (2.1s) — effectively a still screenshot**
   - `clip.sh` literally comments `# The README nav screenshot` and only types `s` (`sleep:0.8`).
   - **Fix:** Either mark `STILL=1` and embed `nav-pane.png` as a static image (`![...](./images/nav-pane.png)`), or add actual Nav actions (`Down`, `Right` into `src/`, `Left` back, `Up` into prompt).

---

## 2. Placement-by-Placement Audit (by Doc & Section Content)

### [`index.md`](file:///home/archr/gh/_fzs/fist-docs/docs/index.md)
- **Hero (`splash.png`, L5):**
  - *Section says:* Introduces f:st as a terminal file manager built around composable panes, async previews, and configuration.
  - *Verdict:* **Keep.** Strong hero still. (Minor: alt text says *"filtered to images"*, though the `.g` query also leaves `.tar.gz`, `.go`, and `.log` rows visible.)

### [`getting-started.md`](file:///home/archr/gh/_fzs/fist-docs/docs/getting-started.md)
- **`## First run` (`nav-pane.mp4`, L123):**
  - *Section says:* Covers `fs`, `fs :: <PATTERN>`, `fs : <PATTERN>`, typing to fuzzy-filter, pressing `up` at row `0` into the locked prompt (red underline), and `alt-h` help.
  - *Clip does:* Opens `fs` in `harborlight` and types `s` (2.1s, still).
  - *Verdict:* **Convert to still OR expand.** Either switch to `![...](./images/nav-pane.png)` (`STILL=1`) so it doesn't pretend to be a video, or expand `nav-pane` to type `s`, `Right` into `src/`, `Left` back, and `Up` into the red-underlined prompt.
- **`## Tour` (`reel.mp4`, L148):**
  - *Section says:* Summarizes the exact sequence (`z`, full-text search, `$EDITOR` at match, `git diff`, archive extract to inbox via queue, previewing images, jumping back).
  - *Verdict:* **Keep.** Exact match (68.1s).

### [`panes.md`](file:///home/archr/gh/_fzs/fist-docs/docs/panes.md)
- **`## Nav` (`nav-pane.mp4`, L51):**
  - *Section says:* Immediate children without recursing; type to fuzzy-filter; `default_visibility` / `ignore_patterns`.
  - *Verdict:* **Still image or expand.** Same as above: make it a static `<img>` (`STILL=1`), or add `Down` / `Right` / `Left` traversal so the video actually moves.
- **`## Find` (`find.mp4`, L57):**
  - *Section says:* `fd` recursive streaming (`ctrl-f` / `fs ::`), `-t` filters, `exclusions`, leading `.` dot-query reveals hidden files.
  - *Clip does:* `ctrl+f` → `api` → `Down` (3.5s). Shows recursive paths + preview nicely.
  - *Verdict:* **Keep (optional polish).** Extending with `ctrl+u` + `.env` would showcase the dot-query rule mentioned in L55.
- **`## Search` (`search.mp4`, L63):**
  - *Section says:* `ripgrep` path in col 1, matched lines in col 2, `ctrl-r` toggles query vs filter mode, `%` filters match content.
  - *Clip does:* `ctrl+r` `TODO` → `ctrl+r` `src` → `shift+Down` x2 (6.1s).
  - *Verdict:* **Keep (minor polish).** Adding `% pool` or `% rotate` in filter mode would also show `%`.
- **`## Stream and custom panes` (`custom.mp4`, L69):**
  - *Section says:* `fs :custom`, `--input-sep`/`--tail-sep`, `--transform` Lua tails, `--no-store`.
  - *Clip does:* Runs `ob-files`, filters `di`, edits note, filters `% Prog` (col-2 tail), cycles preview layout `?`, runs `new` action (15.5s).
  - *Verdict:* **Keep.** Shows col-2 tails, `%` filtering, and custom preview/actions well.
- **`## History panes` (`history.mp4`, L75):**
  - *Section says:* `ctrl-g` opens Folders, toggles Folders ↔ Files in place, `ctrl-z` backs out.
  - *Clip does:* `ctrl+g` → `ctrl+s` → `ctrl+g` → `ctrl+s` (6.5s).
  - *Verdict:* **Keep.**
- **`## Stash panes` (`stash.mp4`, L81):**
  - *Section says:* `alt-s` / `alt-b`, `Stash(name)` smart push / open / back out.
  - *Clip does:* Marks + `alt+s` across two dirs, then `alt+s` unselected to open stash (9.5s).
  - *Verdict:* **Keep.**
- **`## App pane and pending files` (`apps.mp4`, L87):**
  - *Section says:* `open with` / `fs :open`, desktop app icons in preview, and **`alt-u` inside App pane shows pending-files list**.
  - *Clip does:* `open with` on `coast.png` → opens App pane with VS Code icon + `Opening: coast.png` footer (5.5s), **never presses `alt+u`**.
  - *Verdict:* **Improve `apps` in `clip.sh`:** append `sleep:0.6 alt+u sleep:0.9` so the pending-files list in the section title is shown.
- **`## Previews` (`previews.mp4`, L102):**
  - *Section says:* `preview` preset, `?` cycles layouts, `alt-/` display, `alt-i` info, `shift-up/down` scroll, `ctrl-l`/`alt-l` pager.
  - *Clip does:* Directory (`preview` + `alt+i`), SQLite (`preview` + `?`), SVG (`alt+l` pager), photo (`preview` + `alt+i`) (14.1s).
  - *Verdict:* **Keep.**
- **`## Options overlay` (`options.mp4`, L114):**
  - *Section says:* Describes three columns: **Filter**, **Sort**, and **Pane** (e.g. `one line` / `regex` in Search).
  - *Clip does:* Opens `alt+p` on Nav (only 2 columns) and sits idle for 3.1s without pressing anything.
  - *Verdict:* **Improve or make still.** Either switch to `options.png` (`STILL=1`), or interact with Filter/Sort (and optionally open `alt+p` in Search so the `Pane` column appears).
- **`## Queue overlay` (`queue.mp4`, L122):**
  - *Section says:* `alt-u` lists pending/running/completed/failed rows by kind (`copy`, `move`, etc.), edit in place, reorder, filter, cancel, `enter` to dispatch.
  - *Clip does:* Enqueues `copy`, `move`, `copy`, opens `alt+u` (10.5s).
  - *Verdict:* **Keep.**
- **`## Menu, confirm, and prompt overlays` (L124–128) — MISSING CLIP:**
  - *Section says:* Menu (`alt-e`), Confirm (`Delete`), Prompt (`ctrl-n`, `ctrl-shift-n`, `f2`).
  - *Verdict:* **Move `fileops.mp4` here** (shows Prompt for `ctrl-n` / `ctrl-shift-n` / `f2` and Confirm for `shift-delete`) and/or **`action.mp4`** (Menu overlay).

### [`command-line.md`](file:///home/archr/gh/_fzs/fist-docs/docs/command-line.md)
- **`## The subcommand map` (`splash.png`, L31):**
  - *Section says:* Table mapping `:fd`/`::`, `:rg`/`:`, `:custom`, `:dir`, `:file`, `:open`, `:info`, `:tool`.
  - *Clip does:* Static Find pane screenshot (`fs :: --sort=size .` with `.g`). Doesn't illustrate the subcommand map at all.
  - *Verdict:* **Remove** from `command-line.md` (already used in `index.md` and `sorting.md`).

### [`navigation-in-depth.md`](file:///home/archr/gh/_fzs/fist-docs/docs/navigation-in-depth.md)
- **`## Browsing archives transparently` (`archive.mp4`, L17):**
  - *Section says:* `Advance` (`right`) enters `.zip`/`.tar.gz`, reads/copies work normally, `Parent` (`left`) returns directly to the directory containing the archive.
  - *Clip does:* Enters `release-1.2.0.zip`, cuts `README.md`, `Left` back to `archive/`, pastes, enters `backup-2024-04.tar.gz` → `data/`, `Up` (12.5s).
  - *Verdict:* **Keep.**
- **`## Undo and redo` (`undo.mp4` at L43, `undo-jump.mp4` at L47):**
  - *Section says:* `Undo` (`ctrl-z`) and `Redo` (`alt-z`) walk the stack; L45 describes jumping via `ctrl-g`, copying/cutting a file, and `ctrl-z` back to paste.
  - *`undo.mp4` (15.1s):* Uses `ctrl-z` repeatedly, **never uses `Redo` (`alt-z`)**. **Improve:** add `alt+z` (`Redo`) in `clip.sh`.
  - *`undo-jump.mp4` (10.5s):* **Broken** (`No items queued.` — see §1). **Fix `clip.sh`**; once fixed, it matches L45–47 word for word.
- **`## Prompt locking` (`prompt.mp4`, L77):**
  - *Section says:* `shift-left`/`shift-right` vs `left`/`right` swap, red `[query_locked]` border, `up` auto-lock, `ctrl-space`/`alt-hyphen` toggle, `alt-space` jump/accept.
  - *Clip does:* `Up` lock, `ctrl+space` unlock, `ctrl+f` `auth` auto-lock, `ctrl+space` unlock, `Left`, `Up`, `alt+Return` exit (10.5s).
  - *Verdict:* **Keep** (minor: `alt+Return` exit at the end is unrelated to locking; removing it avoids changing the final frame away from the locked prompt).

### [`find-pane.md`](file:///home/archr/gh/_fzs/fist-docs/docs/find-pane.md)
- **`## Working with results` (`find.mp4`, L87):**
  - *Section says:* Fuzzy re-filtering, `%` tail matching, `alt-p` sorting, `ctrl-s` hidden toggle, `ctrl-d` filetype cycling, `tab` marking, `ctrl-c`/`ctrl-x`, `alt-e`, `right` advance.
  - *Clip does:* Only `ctrl+f`, `api`, `Down` (3.5s) — demonstrates none of the bullets below it.
  - *Verdict:* **Improve `find` or film `find-results`:** add `ctrl+d` (Dirs/Files cycle), `tab` marking, or `ctrl+s` so the clip illustrates actually *working with* results.

### [`search-pane.md`](file:///home/archr/gh/_fzs/fist-docs/docs/search-pane.md)
- **`## Query mode and filter mode` (`search.mp4`, L33):**
  - *Section says:* `ctrl-r` toggles query mode vs filter mode; L35 explains `%` splitting column 1 and column 2 (`src/api % Bearer`).
  - *Clip does:* `ctrl+r` `TODO`, `ctrl+r` `src`, preview scroll (6.1s).
  - *Verdict:* **Keep (minor polish):** append ` % pool` or ` % rotate` in filter mode so `%` is shown too.

### [`history-database.md`](file:///home/archr/gh/_fzs/fist-docs/docs/history-database.md)
- **`## History panes` (`history.mp4`, L75):**
  - *Section says:* `ctrl-g` opens Folders and toggles Folders ↔ Files; `ctrl-z` backs out; `ctrl-s` toggles `frecency` ↔ `atime`.
  - *Clip does:* `ctrl+g` `ctrl+s` `ctrl+g` `ctrl+s` (6.5s).
  - *Verdict:* **Keep.**

### [`stash-panes.md`](file:///home/archr/gh/_fzs/fist-docs/docs/stash-panes.md)
- **`## Actions` (`stash.mp4`, L13):**
  - *Section says:* Explains `PushStash`, `OpenStash`, and `Stash(name)` smart behavior (`alt-s`).
  - *Clip does:* Pushes across two dirs, then opens stash with `alt+s`.
  - *Verdict:* **Keep.**
- **`## Cross-directory workflows` (`compress.mp4`, L76):**
  - *Section says:* *"navigate across several directories, mark files with `tab` and press `alt-s` in each directory, then press `alt-s` with nothing selected to open the stash, press `ctrl-a` to select all stashed rows, and run `compress: zip` or `diff` from `alt-e`."*
  - *Clip does:* Selects two adjacent files in `harborlight/docs` and zips them — **never touches a stash**.
  - *Verdict:* **Replace with new `stash-workflow` clip.**

### [`custom-pane.md`](file:///home/archr/gh/_fzs/fist-docs/docs/custom-pane.md)
- **`## Example: a markdown notes manager` (`custom.mp4`, L65):**
  - *Section says:* Shows the notes manager (`fs -t .md ... | fs :custom --tail-sep $'\t' --transform ...`), `% Prog` filtering, `right` to edit, custom `new` menu action.
  - *Clip does:* Literally runs this exact workflow.
  - *Verdict:* **Keep.**

### [`visibility.md`](file:///home/archr/gh/_fzs/fist-docs/docs/visibility.md)
- **`## The options overlay` (`filters.mp4`, L35):**
  - *Section says:* `alt-p` Filter column toggles (`hidden-only`, `hidden`, `ignored`, `Dirs`, `Files`, `all`).
  - *Clip does:* Walks through `hidden-only`, `hidden`, `Dirs`, `Files`, `all` in `alt+p` while the list updates behind it (6.1s).
  - *Verdict:* **Keep.**

### [`sorting.md`](file:///home/archr/gh/_fzs/fist-docs/docs/sorting.md)
- **`## Choosing a sort` (`sort.mp4`, L29):**
  - *Section says:* Choosing sort via CLI `--sort`, Options overlay (`alt-p`), or `SetSort`.
  - *Clip does:* Opens `alt+p`, picks `size` (shows byte sizes), switches to `mtime` (6.5s).
  - *Verdict:* **Keep.**
- **`## Size sorting` (`splash.png`, L46):**
  - *Section says:* `size` computes recursive directory sizes in the background.
  - *Clip does:* Shows size-sorted Find results (`2.5 MB`, `2.1 MB`, …, `23 B`). (Note: only files match `.g`, no directories with recursive sizes, though `sort.mp4` above shows directory sizes on `harborlight`.)
  - *Verdict:* **Keep** (or replace with a screenshot showing sorted directory sizes like `src/`, `target/`).

### [`menu-actions.md`](file:///home/archr/gh/_fzs/fist-docs/docs/menu-actions.md)
- **`## Strategies` (`compress.mp4`, L43):**
  - *Section says:* Table of all 7 strategies (`Exec`, `ExecWait`, `ExecSilent`, `ExecPaged`, `Queue`, `QueueBatch(n)`, `Enqueue`); L45 immediately below explains `Queue`, `QueueBatch`, and `Enqueue` creating queue rows.
  - *Clip does:* Runs `compress: zip` (which in `assets/actions/compress.toml` uses `strategy = "Exec"`, not `Queue`/`Enqueue`!) on two files in `docs/`.
  - *Verdict:* **Move** `compress.mp4` down to `## Examples` (as an `Exec` example, or alongside `diff.mp4`), and either remove the clip from `## Strategies` or film a `Queue`/`QueueBatch` action (`convert-webp` or similar) showing it queued in `alt-u`.
- **`## Examples` (`action.mp4`, L103):**
  - *Section says:* *"Ready-to-use action bundles for archiving, diffing, media conversion, file organization, and sharing ship in `assets/actions/`."*
  - *Clip does:* Opens `alt+e` on `architecture.md` (no custom bundle actions even visible in `action.png`—just `New`, `Rename`, `Move`, `Copy`, `Trash`, `Delete`, `Open`, `open With`, `new Folder`, `symlink`), scrolls down 3 rows, **presses `Escape` without running anything**, and opens the file with `Right` (7.1s).
  - *Verdict:* **Move `action.mp4` to `panes.md`** (`## Menu, confirm, and prompt overlays`) or **`mm.toml.md` (`### Menu`)** as a Menu overlay tour, and place `compress.mp4` (or a new bundle-action clip) under `menu-actions.md#examples`.
- **`### Diff two selected files in the pager (ExecPaged)` (`diff.mp4`, L130):**
  - *Section says:* Shows the `diff` (`ExecPaged`) TOML snippet on two selected files.
  - *Clip does:* Diffs two files in pager + compares two directories (11.5s).
  - *Verdict:* **Keep.**

### [`queue.md`](file:///home/archr/gh/_fzs/fist-docs/docs/queue.md)
- **`## The queue overlay` (`queue.mp4`, L15):**
  - *Section says:* `alt-u` opens Queue overlay, `q`/`esc` closes, `alt-h` help, pending-files variant in App pane.
  - *Clip does:* Enqueues `copy`, `move`, `copy` and opens `alt+u` (10.5s).
  - *Verdict:* **Keep.**
- **`## Executing and pasting` (`move.mp4`, L71):**
  - *Section says:* `Enter` in overlay, destination resolution, re-running completed rows, `Paste` (`ctrl-v`).
  - *Clip does:* Cuts `archive-me.md`, jumps via `ctrl+g` to `archive/`, pastes (`ctrl-v`), opens `alt+u` showing green completed row (8.1s).
  - *Verdict:* **Keep.**
- **`## Editing rows` (`queue-edit.mp4`, L99):**
  - *Section says:* **`alt-e` edits `Source`** and **`f2` edits `To`**.
  - *Clip does:* Never presses `alt-e` or `f2`! Instead it deletes a row (`Delete`), dispatches the survivor (`Enter`), deletes the output on disk, reopens `alt+u`, and re-runs the completed row (`Enter`) (21.1s).
  - *Verdict:* **Move or rewrite.** Either move `queue-edit.mp4` to **`## Clearing completed rows`** (L110, which documents `clear_completed_on_close` keeping completed rows to re-run!) and film a real `queue-edit` clip using `f2` and `alt-e`, OR rewrite `queue-edit` in `clip.sh` to edit `To` with `f2` and `Source` with `alt-e`.
- **`## Progress and the status line` (`long-copy.mp4`, L119):**
  - *Section says:* Byte-weighted completion percentage and live `0%`–`100%` progress gauge in `alt-u`.
  - *Clip does:* **Broken** — copies `release-notes.pdf` (3.4 KB) instead of `bulk.bin` (2 GiB), so no progress bar is visible (see §1).
  - *Verdict:* **Keep placement, fix `long-copy` in `clip.sh`.**
- **`## Extraction rows` (`archive.mp4`, L179):**
  - *Section says:* Advancing (`right`) into an archive starts an `extract` row immediately in `alt-u`; its source/dest cells cannot be edited; failures record in the mount registry.
  - *Clip does:* Enters `.zip` and `.tar.gz`, cuts/pastes `README.md`, **never opens `alt+u`**, so no `extract` row is ever shown.
  - *Verdict:* **Replace with a new `extract` clip** that enters an archive (or runs `extract` from `alt+e`) and opens `alt+u` showing the `extract` row.

### [`lessfilter.md`](file:///home/archr/gh/_fzs/fist-docs/docs/lessfilter.md)
- **`## Presets` (`previews.mp4` at L40, `info.mp4` at L44):**
  - *Section says:* Table of 9 presets (`preview`, `display`, `extended`, `info`, `open`, `edit`, …), `default` competition, and CLI examples `fs :tool lessfilter info photo.jpg`.
  - *`previews.mp4` (14.1s):* Exercises `preview`, `info`, and `extended` across dir, SQLite, SVG, photo. **Keep.**
  - *`info.mp4` (4.5s):* Opens `alt+i` (`info` preset) on `iceland.jpg`. **Keep** (moving L44 below L51 pairs it directly with `fs :tool lessfilter info photo.jpg`, though `info.mp4` uses the TUI `alt+i` rather than CLI).
- **`## Images and graphics protocols` (`image.mp4`, L179):**
  - *Section says:* `<MM_IMAGE>` rendering via Kitty / iTerm2 / Sixel, fit/filter options.
  - *Clip does:* Previews JPGs via sixel and scrolls a portrait photo (5.5s).
  - *Verdict:* **Keep.**
- **`## Paging and headers` (`paged.mp4`, L191):**
  - *Section says:* `Text` action with `bat` + `pager.toml`, `--header`/`Header`, `HIGHLIGHT_LINE`.
  - *Clip does:* Pages `users.json` (`Text` via `bat`) and `release-notes.pdf` (`Extract`) with `ctrl+l` + `/` search (9.1s).
  - *Verdict:* **Keep** (minor: neither file shows `Header` or `HIGHLIGHT_LINE`; `search.mp4` shows `HIGHLIGHT_LINE` in preview, and `paged.mp4` fits `pager.md` best).

### [`pager.md`](file:///home/archr/gh/_fzs/fist-docs/docs/pager.md)
- **`## When output gets paged` (`paged.mp4`, L13):**
  - *Section says:* `ExecPaged`, `LFPaged(preset)`, `q` returns to active pane, `Text` in `display`/`extended`, `fs :tool pager`.
  - *Clip does:* `ctrl+l` (`LFPaged`) on JSON and PDF, searches (`/`), scrolls (`space`), quits (`q`) (9.1s).
  - *Verdict:* **Keep.**

### [`shell-integration.md`](file:///home/archr/gh/_fzs/fist-docs/docs/shell-integration.md)
- **`## The nav function` (`nav.mp4`, L62):**
  - *Section says:* `x` opens the Nav pane inside the best matching directory from history (or cwd), plus `FS_INITIAL_INPUT` fallback.
  - *Clip does:* Runs `x src`, then spends 15s in Find/Options and **accidentally triggers `Move: mod.rs`** (`ctrl+x`) at the end (see §1).
  - *Verdict:* **Refilm `nav.mp4`** cleanly around `x` (e.g., `x src`, browse a directory/file, accept or exit cleanly—or show `x` with no args / `FS_INITIAL_INPUT`).
- **`## Line-editor widgets` (`shell.mp4`, L87):**
  - *Section says:* `shift-left` (dir search `cd`), `shift-right` (file search multi-select append), `shift-down` (full-text search → `$EDITOR` at match).
  - *Clip does:* `z harb` → `shift-left` (`src`) → `shift-down` (`rotate`, edit + save) → `git add ` + `shift-right` (multi-select) → `git status` (37.1s).
  - *Verdict:* **Keep.**

### [`tools.md`](file:///home/archr/gh/_fzs/fist-docs/docs/tools.md)
- **`## shell` (`shell.mp4`, L45):**
  - *Section says:* `fs :tool shell` emits the init script (`--shell=zsh`, `bash`, etc.).
  - *Clip does:* Uses bash widgets (doesn't run `fs :tool shell`; already in `shell-integration.md`).
  - *Verdict:* **Remove** from `tools.md` (already links to `shell-integration.md`).
- **`## bump` (`history.mp4`, L61):**
  - *Section says:* `fs :tool bump -c 5 ...`, `--glob`, `--prune`, `--reset` CLI commands.
  - *Clip does:* TUI `ctrl-g` / `ctrl-s` in History panes. Never runs `fs :tool bump`.
  - *Verdict:* **Remove** from `tools.md` (or film a CLI `cli-bump` clip).
- **`## History and stats: fs :info` (`info.mp4`, L144):**
  - *Section says:* `fs :info` (prints config/log paths) and `fs :info dirs --sort=frecency --limit=20`.
  - *Clip does:* **Completely wrong feature** — shows TUI `alt-i` (`mediainfo` on `iceland.jpg`).
  - *Verdict:* **Remove** from `tools.md` (or film a CLI `cli-info` clip).

### [`output-templates.md`](file:///home/archr/gh/_fzs/fist-docs/docs/output-templates.md)
- **`## The cwd prompt template` (`prompt.mp4`, L116):**
  - *Section says:* `[interface] cwd_prompt` (`"{=} "`) collapses home to `~` raw; `{:}` adds shell quotes.
  - *Clip does:* Shows `~/work ` on `Up`, then spends most of the clip toggling `ctrl+space`, switching to Find `auth`, and exiting via `alt+Return`.
  - *Verdict:* **Replace with still (`cwd-prompt.png`) or keep.** A cropped/focused still of the `Up` cwd prompt (using `POSTER_AT` from `prompt` or a 1-frame still) illustrates `{=} ` better than a 10.5s locking/exit video.

### [`mm.toml.md`](file:///home/archr/gh/_fzs/fist-docs/docs/mm.toml.md)
- **`## Binds` (`fileops.mp4`, L24):**
  - *Section says:* `[binds]` configuration, merging over built-in keymap, `fs :tool showbinds`, `^^` mode prefixes (`nav^^alt-n`).
  - *Clip does:* Creates `note.md` (`ctrl-n`), `folder` (`ctrl-shift-n`), renames (`f2`), deletes (`shift-delete` + Confirm) in `inbox/`. Nothing about `mm.toml` or `[binds]`.
  - *Verdict:* **Move `fileops.mp4` to `panes.md`** (`## Menu, confirm, and prompt overlays`) or `getting-started.md` (`## Core keybindings`).

### Docs with no clips & unused assets
- [`configuration.md`](file:///home/archr/gh/_fzs/fist-docs/docs/configuration.md), [`lua.md`](file:///home/archr/gh/_fzs/fist-docs/docs/lua.md): Reference pages — no clips needed.
- [`mount-pane.md`](file:///home/archr/gh/_fzs/fist-docs/docs/mount-pane.md): Stub page — film a `mount` clip once the page is written.
- **Unused files in `docs/images/`:** `custom-stream-directory-preview.png` and `custom-stream-new-note.png` are unreferenced in `docs/*.md` and not in `clip.sh` (candidates for removal).

---

## 3. Summary of Changes to `clip.sh` & New Clips to Film

### Fix / improve existing scenes in `clip.sh`
1. **`nav-pane`:** Either set `STILL=1` (and embed `nav-pane.png` as an image in `getting-started.md` and `panes.md`), or add actions: filter `s`, `Right` into `src/`, `Down` across files, `Left` back, `Up` into prompt.
2. **`long-copy`:** Add `text:bulk sleep:0.3` before `ctrl+c` so it copies the 2 GiB `bulk.bin` instead of `release-notes.pdf`, and set `POSTER_AT` while the queue progress bar is mid-copy.
3. **`undo-jump`:** Enter `inbox/` (`text:inb Right`) or use `ctrl+f` inside `vault/` before `text:quick ctrl+c` so `ctrl+v` actually pastes a queued item instead of printing `No items queued.`.
4. **`nav`:** Strip out the Find/Options tail (which currently ends in an accidental `Move: mod.rs`) and focus cleanly on `x` (`x src`, browse briefly, accept or quit cleanly).
5. **`apps`:** Press `alt+u` at the end inside the App pane to show the `To open:` pending-files overlay.
6. **`options`:** Either set `STILL=1` or toggle a Filter + Sort option (and consider opening `alt+p` in Search so the `Pane` column is visible).
7. **`find`:** Add `ctrl+d` (cycle Dirs/Files) and `tab` selection so it matches `find-pane.md#working-with-results`.
8. **`search`:** Add ` % pool` (or ` % rotate`) in filter mode to demonstrate col-2 `%` filtering.
9. **`undo`:** Add `alt+z` (`Redo`) after a `ctrl+z` step so both Undo and Redo are shown.
10. **`queue-edit`:** Either update to actually edit `To` (`f2`) and `Source` (`alt+e`), OR move the current recording to `queue.md#clearing-completed-rows` and film a new `queue-edit`.

### New scenes to film
1. **`stash-workflow`** → `stash-panes.md` (`## Cross-directory workflows`): Mark with `Tab` + `alt+s` in two directories, `alt+s` to open stash, `ctrl+a` to select all, run `compress: zip` (or `diff`) from `alt+e`.
2. **`extract`** → `queue.md` (`## Extraction rows`): Advance (`Right`) into an archive (or run `extract` from `alt+e`), then open `alt+u` to show the `extract` row.
3. **`queue-edit` (if keeping current clip as `queue-rerun`)** → `queue.md` (`## Editing rows`): Open `alt+u`, press `f2` to edit `To`, `alt+e` to edit `Source`, `Enter` to dispatch.
4. **`cli-info` / `cli-bump` (optional)** → `tools.md` (`## bump`, `## History and stats: fs :info`): Run `fs :info`, `fs :info dirs --sort=frecency --limit=20`, and `fs :tool bump` in `FIST_SHELL=1`.
5. **`mount` (future)** → `mount-pane.md`: Once `mount-pane.md` is authored, show opening the Mount pane and unmounting/forgetting an entry.
