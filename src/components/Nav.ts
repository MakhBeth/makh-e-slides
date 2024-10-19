/**
 * Nav component
 *
 * Example usage:
 * <nav-component to="/next-page.html"></nav-component>
 */

interface Navigation {
	activation: {
		from: { url: string };
		entry: { url: string };
	};
}
declare const navigation: Navigation;

interface PageSwapEvent extends Event {
	viewTransition?: {
		types: Set<string>;
	};
	activation: {
		from: { url: string };
		entry: { url: string };
	};
}

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

	disconnectedCallback() {
		// Remove the event listener when the component is removed from the DOM
		document.removeEventListener("keydown", this.handleKeyDown);
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
	private getFullPath(relativePath: string | null): string {
		if (!relativePath) return "#";

		const currentUrl = new URL(window.location.href);

		const fullUrl = new URL(relativePath, currentUrl);

		return fullUrl.pathname + fullUrl.search;
	}

	determineTransitionType(from: string, to: string): string {
		if (!from || !to) {
			return "unknown";
		}

		const toUrl = new URL(to);
		const fromUrl = new URL(from);
		const backUrl = new URL(document.referrer || window.location.href);

		const toPath = toUrl.pathname;
		const fromPath = fromUrl.pathname;
		const backPath = backUrl.pathname;
		const forwardPath = this.getFullPath(this.getAttribute("to"));

		if (toPath === forwardPath) {
			return "forwards";
		}

		if (toPath === backPath) {
			return "backwards";
		}

		if (fromPath === toPath) {
			return "reload";
		}

		return "unknown";
	}

	addEventListeners() {
		if (!this.leftChevron) return;
		this.leftChevron.addEventListener("click", () => {
			window.history.back();
		});

		// Add keyboard event listener
		document.addEventListener("keydown", this.handleKeyDown.bind(this));

		// biome-ignore lint/suspicious/noExplicitAny: new API, TODO UPDATE TYPES
		(window as any).addEventListener("pageswap", async (e: PageSwapEvent) => {
			if (e.viewTransition) {
				const transitionType = this.determineTransitionType(
					e.activation.from?.url,
					e.activation.entry?.url,
				);
				e.viewTransition.types.add(transitionType);
				if (!navigation) {
					localStorage.setItem("transitionType", transitionType);
				}
			}
		});

		// biome-ignore lint/suspicious/noExplicitAny: new API, TODO UPDATE TYPES
		(window as any).addEventListener("pagereveal", async (e: PageSwapEvent) => {
			if (e.viewTransition) {
				let transitionType: string;
				if (!navigation) {
					transitionType = localStorage.getItem("transitionType") || "unknown";
				} else {
					transitionType = this.determineTransitionType(
						navigation.activation.from.url,
						navigation.activation.entry.url,
					);
				}
				console.log("pageReveal:", {
					from: e.activation.from.url,
					entry: e.activation.entry.url,
				});

				e.viewTransition.types.add(transitionType);
			}
		});
	}

	handleKeyDown(event: KeyboardEvent) {
		const to = this.getAttribute("to");
		switch (event.key) {
			case "ArrowLeft":
				window.history.back();
				break;
			case "ArrowRight":
				if (to) {
					window.location.href = to;
				}
				break;
			case "ArrowUp":
				event.preventDefault();
				this.scrollVertically(-1);
				break;
			case "ArrowDown":
				event.preventDefault();
				this.scrollVertically(1);
				break;
		}
	}

	scrollVertically(direction: number) {
		const scrollAmount = window.innerHeight;
		const currentScroll = window.scrollY;
		const maxScroll =
			document.documentElement.scrollHeight - window.innerHeight;

		if (direction > 0 && currentScroll < maxScroll) {
			// Scroll down
			window.scrollTo({
				top: currentScroll + scrollAmount,
				behavior: "smooth",
			});
		} else if (direction < 0 && currentScroll > 0) {
			// Scroll up
			window.scrollTo({
				top: currentScroll - scrollAmount,
				behavior: "smooth",
			});
		} else {
			// If can't scroll, navigate
			if (direction < 0) {
				window.history.back();
			} else {
				const to = this.getAttribute("to");
				if (to) {
					window.location.href = to;
				}
			}
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
