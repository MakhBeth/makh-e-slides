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
			order: "pre",
			handler(html) {
				// Extract stylesheet links from the template
				const styleLinks =
					template.match(/<link rel="stylesheet" href="\/styles\/.*\.css">/g) ||
					[];

				// Insert the content and preserve the stylesheet links
				const result = template.replace(
					"<%- content %>",
					html + styleLinks.join("\n"),
				);
				return result;
			},
		},
		load(id) {
			if (id.endsWith(".html")) {
				const content = fs.readFileSync(id, "utf-8");
				// Extract stylesheet links from the template
				const styleLinks =
					template.match(/<link rel="stylesheet" href="\/styles\/.*\.css">/g) ||
					[];

				// Insert the content and preserve the stylesheet links
				return template.replace(
					"<%- content %>",
					content + styleLinks.join("\n"),
				);
			}
		},
	};
}
