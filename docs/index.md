<div class="linear-hero">
  <div class="linear-badge">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
    <span>Documentation</span>
  </div>
  <h1 class="linear-hero-title">f:ist Documentation</h1>
  <p class="linear-hero-subtitle">
    <strong>F:ist</strong> (<strong>F</strong>ist: <strong>I</strong>nteractive <strong>S</strong>earch <strong>T</strong>ool) is a fast, keyboard-first browser and launcher for your filesystem. It wraps <code>fd</code>, <code>ripgrep</code>, <code>eza</code>, and a zoxide-style jump database in one cohesive, extensible terminal interface.
  </p>
  <div class="linear-quick-chips">
    <a href="./getting-started" class="linear-chip">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>
      <span>Quick start</span>
    </a>
    <a href="./core-workflows" class="linear-chip">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      <span>Core workflows</span>
    </a>
    <a href="./panes" class="linear-chip">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
      <span>Explore panes</span>
    </a>
    <a href="./menu-actions" class="linear-chip">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      <span>Menu actions</span>
    </a>
  </div>
</div>

<div class="linear-callout">
  <div class="linear-callout-icon">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
  </div>
  <div class="linear-callout-content">
    <strong>Apology for this documentation.</strong> These pages are an AI-drafted, incomplete scaffold — the prose will be rewritten by hand later.
  </div>
</div>

![The main interface](./images/01-hero.png)

## Browse by topic

<div class="linear-sections-grid">

  <div class="linear-section-card">
    <div class="linear-section-header">
      <div class="linear-section-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
      </div>
      <h3 class="linear-section-title">Getting started</h3>
    </div>
    <p class="linear-section-desc">Get up and running with installation, first launch, and core navigation.</p>
    <ul class="linear-link-list">
      <li class="linear-link-item">
        <a href="./getting-started">
          <span>Getting started</span>
          <span class="arrow">→</span>
        </a>
      </li>
      <li class="linear-link-item">
        <a href="./core-workflows">
          <span>Core workflows</span>
          <span class="arrow">→</span>
        </a>
      </li>
    </ul>
  </div>

  <div class="linear-section-card">
    <div class="linear-section-header">
      <div class="linear-section-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
      </div>
      <h3 class="linear-section-title">Panes & Navigation</h3>
    </div>
    <p class="linear-section-desc">Understand the pane stack model, fuzzy filtering, and search backends.</p>
    <ul class="linear-link-list">
      <li class="linear-link-item">
        <a href="./panes">
          <span>Panes overview</span>
          <span class="arrow">→</span>
        </a>
      </li>
      <li class="linear-link-item">
        <a href="./navigation-in-depth">
          <span>Navigation, in depth</span>
          <span class="arrow">→</span>
        </a>
      </li>
      <li class="linear-link-item">
        <a href="./find-pane">
          <span>The find pane (<code>fd</code>)</span>
          <span class="arrow">→</span>
        </a>
      </li>
      <li class="linear-link-item">
        <a href="./search-pane">
          <span>The search pane (<code>rg</code>)</span>
          <span class="arrow">→</span>
        </a>
      </li>
      <li class="linear-link-item">
        <a href="./history-database">
          <span>History & database</span>
          <span class="arrow">→</span>
        </a>
      </li>
      <li class="linear-link-item">
        <a href="./stash-panes">
          <span>Stash panes</span>
          <span class="arrow">→</span>
        </a>
      </li>
      <li class="linear-link-item">
        <a href="./custom-pane">
          <span>The custom pane</span>
          <span class="arrow">→</span>
        </a>
      </li>
      <li class="linear-link-item">
        <a href="./visibility">
          <span>Visibility</span>
          <span class="arrow">→</span>
        </a>
      </li>
      <li class="linear-link-item">
        <a href="./sorting">
          <span>Sorting</span>
          <span class="arrow">→</span>
        </a>
      </li>
    </ul>
  </div>

  <div class="linear-section-card">
    <div class="linear-section-header">
      <div class="linear-section-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
      </div>
      <h3 class="linear-section-title">Menu & Scripting</h3>
    </div>
    <p class="linear-section-desc">User-defined actions, their Lua, and the queue they schedule.</p>
    <ul class="linear-link-list">
      <li class="linear-link-item">
        <a href="./lua">
          <span>Lua scripting</span>
          <span class="arrow">→</span>
        </a>
      </li>
      <li class="linear-link-item">
        <a href="./menu-actions">
          <span>Menu actions</span>
          <span class="arrow">→</span>
        </a>
      </li>
      <li class="linear-link-item">
        <a href="./queue">
          <span>The queue</span>
          <span class="arrow">→</span>
        </a>
      </li>
    </ul>
  </div>

  <div class="linear-section-card">
    <div class="linear-section-header">
      <div class="linear-section-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
      </div>
      <h3 class="linear-section-title">Configuration</h3>
    </div>
    <p class="linear-section-desc">Config files, preview presets (lessfilter), the pager, and the matchmaker UI layer.</p>
    <ul class="linear-link-list">
      <li class="linear-link-item">
        <a href="./configuration">
          <span>Configuration</span>
          <span class="arrow">→</span>
        </a>
      </li>
      <li class="linear-link-item">
        <a href="./lessfilter">
          <span>lessfilter</span>
          <span class="arrow">→</span>
        </a>
      </li>
      <li class="linear-link-item">
        <a href="./pager">
          <span>The pager</span>
          <span class="arrow">→</span>
        </a>
      </li>
      <li class="linear-link-item">
        <a href="./mm.toml">
          <span>mm.toml</span>
          <span class="arrow">→</span>
        </a>
      </li>
    </ul>
  </div>

  <div class="linear-section-card">
    <div class="linear-section-header">
      <div class="linear-section-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
      </div>
      <h3 class="linear-section-title">Mechanics & Extensibility</h3>
    </div>
    <p class="linear-section-desc">Shell hooks, the command line, tools, and output formatting.</p>
    <ul class="linear-link-list">
      <li class="linear-link-item">
        <a href="./shell-integration">
          <span>Shell integration</span>
          <span class="arrow">→</span>
        </a>
      </li>
      <li class="linear-link-item">
        <a href="./command-line">
          <span>Command line</span>
          <span class="arrow">→</span>
        </a>
      </li>
      <li class="linear-link-item">
        <a href="./tools">
          <span>Tools (<code>fs :tool</code>)</span>
          <span class="arrow">→</span>
        </a>
      </li>
      <li class="linear-link-item">
        <a href="./output-templates">
          <span>Output & templates</span>
          <span class="arrow">→</span>
        </a>
      </li>
    </ul>
  </div>

</div>

## The mental model

Everything in f:ist happens inside a **pane** — a filterable, sortable, previewable list of paths — and the **stack** of panes you've visited:

- The **Nav** pane browses a directory.
- **Find**, **Search**, **History**, **Apps**, **Stash** and **Custom** panes produce lists from different sources (`fd`, `ripgrep`, the history database, your app registry, a stash, or any command's output).
- `Undo` / `Redo` (<kbd>ctrl-z</kbd> / <kbd>ctrl-shift-z</kbd>) walk back and forth through your pane history. There is no way to get lost.
- The **queue** holds pending file operations (copy/cut/paste).
- The **menu** (<kbd>ctrl-e</kbd>) exposes context-aware actions for the current selection.

You rarely switch "modes". Instead you *filter what you see* (type to fuzzy-match, <kbd>ctrl-s</kbd> to show hidden files, <kbd>ctrl-d</kbd> to show only directories) and *act* on the result with one or two keys.

## Quick keybinding cheat sheet

| Shortcut | Action | Scope |
| --- | --- | --- |
| <kbd>Enter</kbd> | Accept item (cd directory / open file) | Everywhere |
| <kbd>ctrl-f</kbd> | Open Find pane (`fd` recursive filename search) | Everywhere |
| <kbd>ctrl-r</kbd> | Open Search pane (`rg` full-text search) | Everywhere |
| <kbd>ctrl-g</kbd> | Open History pane (recents database) | Everywhere |
| <kbd>ctrl-e</kbd> | Open Context Menu (actions & tools) | Everywhere |
| <kbd>ctrl-z</kbd> / <kbd>ctrl-shift-z</kbd> | Undo / Redo pane navigation | Everywhere |
| <kbd>?</kbd> | Toggle file preview | Everywhere |
| <kbd>alt-h</kbd> | In-app keybinding help | Everywhere |

<div class="linear-callout">
  <div class="linear-callout-icon">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
  </div>
  <div class="linear-callout-content">
    <strong>Need full reference?</strong> Run <code>fs :tool show-binds</code> from your shell or check the <a href="./menu-actions">menu actions</a> chapter for Lua action schemas.
  </div>
</div>
