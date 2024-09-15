import fs from "node:fs";
import type { Plugin } from "vite";

export default function htmlTemplateWrapper(templatePath: string): Plugin {
	let template: string;

	return {
		name: "html-template-wrapper",
		configResolved() {
			template = fs.readFileSync(templatePath, "utf-8");
		},
		transformIndexHtml: {
			order: "post",
			handler(html) {
				return template.replace("<%- content %>", html);
			},
		},
		load(id) {
			if (id.endsWith(".html")) {
				const content = fs.readFileSync(id, "utf-8");
				return template.replace("<%- content %>", content);
			}
		},
	};
}
