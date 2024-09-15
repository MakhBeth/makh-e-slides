class Page extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
	}

	connectedCallback() {
		this.render();
	}

	render() {
		if (!this.shadowRoot) return;

		const title = this.getAttribute("title") || "Default Title";

		this.shadowRoot.innerHTML = `
			<!DOCTYPE html>
			<html lang="en">
				<head>
					<meta charset="UTF-8" />
					<link rel="icon" type="image/svg+xml" href="/vite.svg" />
					<meta name="viewport" content="width=device-width, initial-scale=1.0" />
					<title>${title}</title>
					<link rel="stylesheet" href="/src/styles/style.css">
					<script type="module" src="/src/components/CodeHighlight.ts"><\/script>
					<style>
						:host {
							display: block;
							width: 100%;
							height: 100%;
						}
						body {
							margin: 0;
							padding: 0;
							min-height: 100vh;
							display: flex;
							flex-direction: column;
						}
					</style>
				</head>
				<body>
					<slot></slot>
				</body>
			</html>
		`;
	}
}

customElements.define("app-page", Page);
