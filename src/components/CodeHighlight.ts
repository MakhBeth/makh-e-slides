import hljs from "highlight.js";

export const CodeHighlight = {
	highlightCode(code: string, language: string): string {
		return hljs.highlight(code, { language }).value;
	},

	render(code: string, language = "javascript"): string {
		const highlightedCode = this.highlightCode(code, language);
		return `<pre><code class="hljs language-${language}">${highlightedCode}</code></pre>`;
	},
};

// Only define the custom element in the browser
if (typeof window !== "undefined") {
	class CodeHighlightElement extends HTMLElement {
		connectedCallback() {
			const code = this.textContent || this.innerHTML || "";
			const language = this.getAttribute("language") || "javascript";
			this.innerHTML = CodeHighlight.render(code, language);
		}
	}

	customElements.define("code-highlight", CodeHighlightElement);
}

// Usage example:
// <code-highlight language="typescript">
//   const greeting: string = "Hello, World!";
//   console.log(greeting);
// </code-highlight>
