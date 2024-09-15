import { highlight, languages } from "prismjs";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-javascript";
import { match } from "ts-pattern";

class CodeHighlight extends HTMLElement {
	connectedCallback() {
		this.render();
	}

	render() {
		const code = this.textContent || "";
		const language = this.getAttribute("language") || "javascript";
		const highlightedCode = this.highlightCode(code, language);

		this.innerHTML = `
      <pre><code class="language-${language}">${highlightedCode}</code></pre>
    `;
	}

	highlightCode(code: string, language: string): string {
		return match(language)
			.with("css", () => highlight(code, languages.css, "css"))
			.with("html", () => highlight(code, languages.markup, "markup"))
			.with("typescript", () =>
				highlight(code, languages.typescript, "typescript"),
			)
			.otherwise(() => highlight(code, languages.javascript, "javascript"));
	}
}

customElements.define("code-highlight", CodeHighlight);

// Usage example:
// <code-highlight language="typescript">
//   const greeting: string = "Hello, World!";
//   console.log(greeting);
// </code-highlight>
