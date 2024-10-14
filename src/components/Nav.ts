/**
 * Nav component
 *
 * Example usage:
 * <nav-component to="/next-page.html"></nav-component>
 */
class Nav extends HTMLElement {
	private leftChevron: HTMLAnchorElement | null = null;

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
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          :host {
            animation: fadeIn 0.25s ease-out;
          }
          :host {
            display: flex;
            justify-content: space-between;
            align-items: center;
						padding: 0 0.5rem;
						gap: 0.5rem;
          }
          button, a {
						all: unset;
						display: block;
            background: none;
            border: none;
            cursor: pointer;
            font-size: 1rem;
            text-decoration: none;
            color: inherit;
						line-height: 1;
						font-size: 3rem;
          }
        </style>
        <button class="left-chevron">&#8249;</button>
        <a class="right-chevron" href="${this.getAttribute("to") || "#"}">&#8250;</a>
      `;

			this.leftChevron = this.shadowRoot.querySelector(
				".left-chevron",
			) as HTMLAnchorElement;
		}
	}

	addEventListeners() {
		if(!this.leftChevron) return
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
