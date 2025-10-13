/**
 * Nav component
 *
 * Example usage:
 * <nav-component to="/next-page.html"></nav-component>
 */

class Nav extends HTMLElement {
	private leftChevron: HTMLAnchorElement | null = null;
	private noBack = false;

	constructor() {
		super();
		this.attachShadow({ mode: "open" });
	}

	connectedCallback() {
		this.noBack = this.hasAttribute("no-back");
		this.render();
		this.addEventListeners();
		this.addPrefetch();
	}

	disconnectedCallback() {
		// Remove the event listener when the component is removed from the DOM
		document.removeEventListener("keydown", this.handleKeyDown);
	}

	render() {
		if (this.shadowRoot) {
			this.shadowRoot.innerHTML = `
        <style>
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
            color: white;
						line-height: 1;
						font-size: 3rem;
          }
          button:hover, a:hover {
            color: #4a90e2;
          }
          button:focus, a:focus {
            outline: 2px solid #4a90e2;
            outline-offset: 2px;
          }
        </style>
        ${this.noBack ? "" : '<button class="left-chevron" aria-label="previous slide">&#8249;</button>'}
        <a class="right-chevron" href="${this.getAttribute("to") || "#"}" aria-label="next slide">&#8250;</a>
      `;

			this.leftChevron = this.shadowRoot.querySelector(
				".left-chevron",
			) as HTMLAnchorElement;
		}
	}

	goBack() {
		if (this.noBack) return;
		window.history.back();
	}

	addEventListeners() {
		// Add keyboard event listener
		document.addEventListener("keydown", this.handleKeyDown.bind(this));

		if (!this.leftChevron) return;
		this.leftChevron.addEventListener("click", () => {
			window.history.back();
		});
	}

	handleKeyDown(event: KeyboardEvent) {
		const to = this.getAttribute("to");
		switch (event.key) {
			case "ArrowLeft":
				this.goBack();
				break;
			case "ArrowRight":
				if (to) {
					window.location.href = to;
				}
				break;
			case "ArrowUp":
				event.preventDefault();
				this.goBack();
				break;
			case "ArrowDown":
				event.preventDefault();
				if (to) {
					window.location.href = to;
				}
				break;
		}
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
		return ["to", "no-back"];
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
		} else if (name === "no-back" && oldValue !== newValue) {
			this.noBack = this.hasAttribute("no-back");
			this.render(); // Re-render to update the left chevron visibility
		}
	}
}

customElements.define("nav-component", Nav);
