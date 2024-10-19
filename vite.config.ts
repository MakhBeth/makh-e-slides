import { defineConfig } from "vite";
import path from "node:path";
import fs from "node:fs";
import htmlTemplateWrapper from "./plugins/htmlTemplate";
import { ssrCodeHighlight } from "./plugins/ssrCodeHighlight";

const slidesDir = path.join(__dirname, "src", "slides");
const slideFiles = Object.fromEntries(
	fs
		.readdirSync(slidesDir)
		.filter((file) => file.endsWith(".html"))
		.map((file) => [
			path.basename(file, ".html"),
			path.resolve(slidesDir, file),
		]),
) as Record<string, string>;

const input = {
	...slideFiles,
};

export default defineConfig({
	appType: "mpa",
	root: path.resolve(__dirname, "src"),
	publicDir: path.resolve(__dirname, "public"), // Add this line
	build: {
		modulePreload: false,
		rollupOptions: {
			input,
		},
		assetsInlineLimit: 0, // Ensure all assets are processed by Vite
	},
	plugins: [
		htmlTemplateWrapper(path.resolve(__dirname, "src/template.html")),
		ssrCodeHighlight(),
	],
	server: {
		hmr: {
			host: "localhost",
		},
	},
});
