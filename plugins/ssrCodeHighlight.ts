import { JSDOM } from "jsdom";
import { CodeHighlight } from "../src/components/CodeHighlight";
import type { Plugin } from "vite";

export function ssrCodeHighlight(): Plugin {
	return {
		name: "ssr-code-highlight",
		transformIndexHtml: {
			order: "pre",
			handler(html) {
				const dom = new JSDOM(html);
				const document = dom.window.document;

				// Find all code-highlight elements and render them
				document.querySelectorAll("code-highlight").forEach((element) => {
					const code = element.innerHTML || "";
					const language = element.getAttribute("language") || "javascript";
					element.outerHTML = CodeHighlight.render(code, language);
				});

				return dom.serialize();
			},
		},
	};
}
