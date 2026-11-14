# Getting started

This guide takes you from a clean environment to a working `fs` installation with core keybindings, shell functions, configuration files, and menu actions.

## Requirements

`fd` (`fd-find`) and `rg` (`ripgrep`) are required at runtime to populate the Find and Search panes. Optional tools unlock rich previews in [lessfilter](./lessfilter) and the [pager](./pager):

| Tool | Role |
| --- | --- |
| `fd` (`fd-find`) | Required for recursive file finding |
| `rg` (`ripgrep`) | Required for full-text search |
| `bat` | Syntax highlighting in previews and the pager |
| `eza` | Directory tree and metadata previews via `fs :tool liza` |
| `kreuzberg` | Text extraction for PDF and office documents |
| `mediainfo` | Audio, video, and image metadata in the `info` preset |

```shell
cargo install fd-find ripgrep
cargo install bat eza kreuzberg-cli mediainfo
```

All six tools are also available in standard system package managers (`apt`, `pacman`, `dnf`, `brew`).

### Terminal support

- **Colors and icons** — Use a terminal with 24-bit truecolor support and a [Nerd Font](https://www.nerdfonts.com/) for file and directory icons.
- **Image previews** — Inline pixel previews work automatically in terminals supporting the Kitty graphics protocol, iTerm2 inline images, or Sixel, and fall back to Unicode halfblocks elsewhere.

## Install

Prebuilt binaries are available for:

- **Linux** — `x86_64` and `aarch64` (`gnu` and static `musl`)
- **macOS** — `x86_64` and `aarch64`
- **Windows** — `x86_64`

Run the install script to detect your platform, download the matching release archive, and install `fs` into `~/.cargo/bin`, `~/.local/bin`, or `/usr/local/bin` (invoking `sudo` only if the target directory is not writable):

```shell
curl -fsSL https://raw.githubusercontent.com/Squirreljetpack/fist/main/install.sh | sh
```

On Windows, use the PowerShell installer:

```powershell
powershell -ExecutionPolicy Bypass -c "irm https://github.com/Squirreljetpack/fist/releases/latest/download/fist-installer.ps1 | iex"
```

Or install through a package manager:

```shell
# Homebrew
brew install Squirreljetpack/tap/fist

# npm
npm install -g @squirreljetpack/fist

# Cargo (builds from source; Rust 1.88+)
cargo install fist
```

Verify the installation:

```shell
fs --version
```

## First run

Launch `fs` with no arguments to open the Nav pane in your current working directory, `fs :: <PATTERN>` to find files recursively, or `fs : <PATTERN>` to search file contents:

```shell
fs
fs :: auth
fs : TODO
```

<video controls preload="none" poster="./images/nav-pane.png" src="./images/nav-pane.mp4"></video>

- **Filter** — Type immediately to fuzzy-filter the current rows.
- **Navigate** — Use `up` and `down` to move the cursor, `left` to climb to the parent directory, and `right` to enter a directory or open a file in `$EDITOR`.
- **Target the working directory** — Pressing `up` at the first row moves focus into the [prompt](./navigation-in-depth#prompt-locking), where actions target the current working directory and `left` / `right` move the text caret instead of changing directories.
- **Help** — Press `alt-h` inside any pane or overlay to open its contextual help document, or run `fs --help` and `fs <subcommand> --help` on the command line.

## Core keybindings

| Category | Keys | Effect |
| --- | --- | --- |
| Movement | `up` / `down`, `left` / `right` | Move cursor, climb to parent (`Parent`), enter directory or edit file (`Advance`) |
| Accepting | `enter`, `alt-enter`, `ctrl-enter` | System open, print path to stdout, detached open |
| Panes | `ctrl-f`, `ctrl-r`, `ctrl-g`, `alt-s` | Switch to Find, Search, History (Folders/Files), or Stash pane |
| Stack | `ctrl-z` / `alt-z` | Undo or redo pane and directory transitions |
| Overlays | `alt-e`, `alt-u`, `alt-p`, `alt-h` | Open Menu, Queue, Options, or Help overlay |
| File ops | `ctrl-c`, `ctrl-x`, `ctrl-v`, `f2`, `delete`, `shift-delete` | Enqueue copy, enqueue move, paste builtins, rename, trash, permanent delete |
| Selection | `tab`, `ctrl-a`, `ctrl-shift-a` | Toggle row and move down, cycle selection group, clear selection |
| Preview | `?`, `alt-/`, `alt-i`, `ctrl-l` | Cycle preview layout, preview preset, info preset, or open in pager |

Run `fs :tool showbinds` to view the complete resolved keymap, or customize bindings in [mm.toml](./mm.toml#binds).

## Set up your shell

Add `fs :tool shell` to your shell startup file to enable frecency jumping, interactive opening, and line-editor widgets:

```shell
# Zsh (~/.zshrc)
eval "$(fs :tool shell --shell=zsh)"

# Bash (~/.bashrc)
eval "$(fs :tool shell --shell=bash)"

# POSIX sh / dash / ash / ksh
eval "$(fs :tool shell --shell=sh)"
```

```fish
# Fish (~/.config/fish/config.fish)
fs :tool shell --shell=fish | source
```

```nushell
# Nushell: generate once, then source from $nu.config-path
fs :tool shell --shell=nu | save -f ~/.config/nushell/fist.nu
source ~/.config/nushell/fist.nu
```

Sourcing the integration defines:

- `z` — frecency-ranked directory jump over f:st's history database.
- `x` — interactive directory jump (starts in the Nav pane inside the best match).
- `Z` — frecency-ranked file opener using the lessfilter `edit` preset.
- Three line-editor widgets: recursive directory search (`shift-left`), recursive file search (`shift-right`), and full-text search (`shift-down`).

Append `--aliases` to `fs :tool shell` to also define short aliases (`lz`, `l`, `la`, `ll`, `n`, `o`) for listing, previewing, editing, and opening files. See [Shell integration](./shell-integration) for the full alias table and keybinding overrides.

## Initialize configuration

Run `fs --dump-config` in an interactive terminal to write the default configuration files into `~/.config/fist`:

```shell
fs --dump-config
```

This creates `config.toml`, `mm.toml`, `lessfilter.toml`, `pager.toml`, and `actions.toml`, skipping any file that already exists. If standard output is piped (`fs --dump-config > resolved.toml`), `fs` prints the merged `config.toml` instead of writing files to disk.

## Get menu actions

Optional [menu action](./menu-actions) bundles for archiving (`compress.toml`), diffing (`diff.toml`), media and document conversion (`conversion.toml`), directory organization (`organize.toml`), and file sharing (`share.toml`) live in [`assets/actions/`](https://github.com/Squirreljetpack/fist/tree/main/assets/actions) in the repository. Copy the bundles you want into `~/.config/fist/actions/` and validate your setup:

```shell
fs :tool check
```

## Tour

The clip below walks through a single continuous session: jumping to a repository with `z`, running a full-text search, advancing into `$EDITOR` at the matched line, reviewing `git diff`, extracting a file from an archive into an inbox via the transfer queue, previewing images, and jumping back.

<video controls preload="none" poster="./images/reel.png" src="./images/reel.mp4"></video>

## Keeping it up to date

Upgrade `fs` by re-running the install script, `cargo install fist --force`, or your package manager's upgrade command. Upgrading the binary never overwrites files in `~/.config/fist`; if you cache the output of `fs :tool shell`, regenerate that cache after upgrading.

## Uninstall

Remove the binary, delete the `fs :tool shell` line from your shell startup file, and remove the configuration, state, and cache directories:

```shell
rm -f ~/.cargo/bin/fs ~/.local/bin/fs /usr/local/bin/fs
rm -rf ~/.config/fist ~/.local/state/fist ~/.cache/fist
```
