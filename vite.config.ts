import { defineConfig } from "vite";
import path from "node:path";
import { exec } from "node:child_process";
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
		{
			name: "open-in-vscode",
			configureServer(server) {
				server.middlewares.use((req, _res, next) => {
					if (req.method === "GET" && req.url?.startsWith("/slides/")) {
						const filepath = `/Users/davidedipumpo/Projects/makh-e-slides/src/${req.url}`;
						exec(
							`/Applications/Visual\\ Studio\\ Code.app/Contents/Resources/app/bin/code "${filepath}"`,
							(err) => {
								if (err) console.error(err);
							},
						);
					}
					next();
				});
			},
		},
	],
	server: {
		hmr: {
			host: "localhost",
		},
	},
});
