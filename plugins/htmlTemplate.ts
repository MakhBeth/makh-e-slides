import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

export default function htmlTemplateWrapper(templatePath: string): Plugin {
	let template: string;

	function processContent(content: string) {
		// Extract stylesheet links from the template
		const styleLinks =
			template.match(/<link rel="stylesheet" href="\/styles\/.*\.css">/g) || [];

		// Insert the content and preserve the stylesheet links
		return template.replace("<%- content %>", content + styleLinks.join("\n"));
	}

	return {
		name: "html-template-wrapper",
		configResolved() {
			template = fs.readFileSync(templatePath, "utf-8");
		},
		transformIndexHtml: {
			enforce: "pre",
			transform(html, ctx) {
				if (ctx.filename) {
					// Read the content of the HTML file
					const content = fs.readFileSync(ctx.filename, "utf-8");
					// Process and return the content
					return processContent(content);
				}
				// If no filename (shouldn't happen), process the provided HTML
				return processContent(html);
			},
		},
	};
}
