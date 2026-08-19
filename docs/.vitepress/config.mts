import { defineConfig } from "vitepress";

const repo = "https://github.com/Squirreljetpack/fist-docs";

export default defineConfig({
	base: "/fist-docs/",
	lang: "en-US",
	title: "f:ist",
	titleTemplate: ":title — f:ist",
	description:
		"F:ist (Fist: Interactive Search Tool) — a fast, keyboard-first browser for your filesystem. Documentation.",
	appearance: "dark",
	lastUpdated: true,
	cleanUrls: true,
	head: [
		["link", { rel: "icon", type: "image/png", href: "/fist-docs/favicon.png" }],
		["meta", { name: "theme-color", content: "#08090a" }],
		["link", { rel: "preconnect", href: "https://fonts.googleapis.com" }],
		[
			"link",
			{ rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
		],
		[
			"link",
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;450;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap",
			},
		],
	],
	themeConfig: {
		logo: "/logo.png",
		siteTitle: "f:ist",
		nav: [{ text: "Docs", link: "/" }],
		socialLinks: [
			{ icon: "github", link: "https://github.com/Squirreljetpack/fist" },
		],
		sidebar: [
			{
				text: "Getting started",
				collapsed: false,
				items: [
					{ text: "Getting started", link: "/getting-started" },
					{ text: "Core workflows", link: "/core-workflows" },
				],
			},
			{
				text: "Panes",
				collapsed: false,
				items: [
					{ text: "Panes overview", link: "/panes" },
					{ text: "Navigation, in depth", link: "/navigation-in-depth" },
					{ text: "The find pane (fd)", link: "/find-pane" },
					{ text: "The search pane (rg)", link: "/search-pane" },
					{ text: "History & the database", link: "/history-database" },
					{ text: "Stash panes", link: "/stash-panes" },
					{ text: "The custom pane", link: "/custom-pane" },
					{ text: "Visibility", link: "/visibility" },
					{ text: "Sorting", link: "/sorting" },
				],
			},
			{
				text: "Menu",
				collapsed: false,
				items: [
					{ text: "Lua scripting", link: "/lua" },
					{ text: "Menu actions", link: "/menu-actions" },
					{ text: "The queue", link: "/queue" },
				],
			},
			{
				text: "Configuration",
				collapsed: false,
				items: [
					{ text: "Configuration", link: "/configuration" },
					{ text: "mm.toml", link: "/mm.toml" },
					{ text: "lessfilter", link: "/lessfilter" },
					{ text: "The pager", link: "/pager" },
				],
			},
			{
				text: "Mechanics",
				collapsed: false,
				items: [
					{ text: "Shell integration", link: "/shell-integration" },
					{ text: "Command line", link: "/command-line" },
					{ text: "Tools (fs :tool)", link: "/tools" },
					{ text: "Output & templates", link: "/output-templates" },
				],
			},
		],
		search: {
			provider: "local",
			options: {
				detailedView: true,
			},
		},
		outline: { level: [2, 3], label: "On this page" },
		editLink: {
			pattern: `${repo}/edit/main/docs/:path`,
			text: "Edit this page on GitHub",
		},
		lastUpdated: { text: "Last updated" },
		docFooter: { prev: "Previous", next: "Next" },
		darkModeSwitchLabel: "Theme",
		returnToTopLabel: "Back to top",
	},
});
