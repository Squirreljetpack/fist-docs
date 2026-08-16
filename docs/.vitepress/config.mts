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
					{ text: "Getting started", link: "/01-getting-started" },
					{ text: "Core workflows", link: "/02-core-workflows" },
				],
			},
			{
				text: "Panes",
				collapsed: false,
				items: [
					{ text: "Panes overview", link: "/03-panes" },
					{ text: "Navigation, in depth", link: "/04-navigation-in-depth" },
					{ text: "The find pane (fd)", link: "/05-find-pane" },
					{ text: "The search pane (rg)", link: "/06-search-pane" },
					{ text: "History & the database", link: "/07-history-database" },
					{ text: "Stash panes", link: "/08-stash-panes" },
					{ text: "The queue", link: "/09-queue" },
				],
			},
			{
				text: "Mechanics",
				collapsed: false,
				items: [
					{ text: "Configuration", link: "/10-configuration" },
					{ text: "Shell integration", link: "/11-shell-integration" },
					{ text: "Previewing with lessfilter", link: "/12-lessfilter" },
					{ text: "Menu actions", link: "/13-menu-actions" },
					{ text: "Command line", link: "/14-command-line" },
					{ text: "Tools (fs :tool)", link: "/15-tools" },
					{ text: "Output & templates", link: "/16-output-templates" },
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
