import { highlight, languages } from "prismjs";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-javascript";
import { match } from "ts-pattern";

class CodeHighlight extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
	}

	connectedCallback() {
		this.render();
	}

	render() {
		const code = this.innerHTML || "";
		const language = this.getAttribute("language") || "javascript";
		const highlightedCode = this.highlightCode(code, language);

		if (!this.shadowRoot) return;
		this.shadowRoot.innerHTML = `
      <style>
        @import url('https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/themes/prism-okaidia.min.css');
        pre {
          padding: 1em;
          border-radius: 5px;
          overflow-x: auto;
        }
      </style>
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
