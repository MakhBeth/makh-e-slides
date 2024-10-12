/**
 * Nav component
 *
 * Example usage:
 * <nav-component to="/next-page.html"></nav-component>
 */
class Nav extends HTMLElement {
	private leftChevron: HTMLAnchorElement;
	private rightChevron: HTMLAnchorElement;

	constructor() {
		super();
		this.attachShadow({ mode: "open" });
	}

	connectedCallback() {
		this.render();
		this.addEventListeners();
		this.addPrefetch();
	}

	render() {
		if (this.shadowRoot) {
			this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
          }
          button, a {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 24px;
            text-decoration: none;
            color: inherit;
          }
        </style>
        <button class="left-chevron">&#8249;</button>
        <a class="right-chevron" href="${this.getAttribute("to") || "#"}">&#8250;</a>
      `;

			this.leftChevron = this.shadowRoot.querySelector(
				".left-chevron",
			) as HTMLAnchorElement;
			this.rightChevron = this.shadowRoot.querySelector(
				".right-chevron",
			) as HTMLAnchorElement;
		}
	}

	addEventListeners() {
		this.leftChevron.addEventListener("click", () => {
			window.history.back();
		});
	}

	addPrefetch() {
		const to = this.getAttribute("to");
		if (to) {
			const link = document.createElement("link");
			link.rel = "prefetch";
			link.href = to;
			document.head.appendChild(link);
		}
	}

	static get observedAttributes() {
		return ["to"];
	}

	attributeChangedCallback(name: string, oldValue: string, newValue: string) {
		if (name === "to" && oldValue !== newValue && this.shadowRoot) {
			const rightChevron = this.shadowRoot.querySelector(
				".right-chevron",
			) as HTMLAnchorElement;
			if (rightChevron) {
				rightChevron.href = newValue || "#";
			}
			this.addPrefetch(); // Re-add prefetch when 'to' attribute changes
		}
	}
}

customElements.define("nav-component", Nav);
