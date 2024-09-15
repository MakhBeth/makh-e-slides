import { defineConfig } from "vite";
import path from "node:path";
import fs from "node:fs";
import htmlTemplateWrapper from "./htmlTemplate";

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
	build: {
		rollupOptions: {
			input,
		},
		assetsInlineLimit: 0, // Ensure all assets are processed by Vite
	},
	plugins: [htmlTemplateWrapper(path.resolve(__dirname, "src/template.html"))],
});
