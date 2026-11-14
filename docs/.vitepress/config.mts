import { defineConfig } from "vitepress";

const repo = "https://github.com/Squirreljetpack/fist-docs";

export default defineConfig({
	base: "/fist-docs/",
	lang: "en-US",
	title: "f:st",
	titleTemplate: ":title — f:st",
	description:
		"f:st — a file manager that runs in your terminal. Documentation.",
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
		siteTitle: "f:st",
		nav: [{ text: "Docs", link: "/" }],
		socialLinks: [
			{ icon: "github", link: "https://github.com/Squirreljetpack/fist" },
		],
		sidebar: [
			{
				text: "Getting started",
				collapsed: false,
				items: [
					{ text: "Overview", link: "/" },
					{ text: "Getting started", link: "/getting-started" },
				],
			},
			{
				text: "Panes",
				collapsed: false,
				items: [
					{ text: "Panes", link: "/panes" },
					{ text: "Navigation in depth", link: "/navigation-in-depth" },
					{ text: "Find pane", link: "/find-pane" },
					{ text: "Search pane", link: "/search-pane" },
					{ text: "History database", link: "/history-database" },
					{ text: "Stash panes", link: "/stash-panes" },
					{ text: "Custom pane", link: "/custom-pane" },
					{ text: "Mount pane", link: "/mount-pane" },
					{ text: "Visibility", link: "/visibility" },
					{ text: "Sorting", link: "/sorting" },
				],
			},
			{
				text: "Menu",
				collapsed: false,
				items: [
					{ text: "Lua", link: "/lua" },
					{ text: "Menu actions", link: "/menu-actions" },
					{ text: "Queue", link: "/queue" },
				],
			},
			{
				text: "Configuration",
				collapsed: false,
				items: [
					{ text: "config.toml", link: "/configuration" },
					{ text: "mm.toml", link: "/mm.toml" },
					{ text: "lessfilter", link: "/lessfilter" },
					{ text: "Pager", link: "/pager" },
				],
			},
			{
				text: "Mechanics",
				collapsed: false,
				items: [
					{ text: "Shell integration", link: "/shell-integration" },
					{ text: "Command line", link: "/command-line" },
					{ text: "Tools", link: "/tools" },
					{ text: "Output templates", link: "/output-templates" },
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
