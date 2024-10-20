import { calculate } from "specificity";

class SpecificityCalc extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.style.opacity = "0";
	}

	connectedCallback() {
		this.render();
		// Trigger the transition after a short delay to ensure the initial render is complete
		requestAnimationFrame(() => {
			this.style.opacity = "1";
		});
	}

	render() {
		const selector = this.textContent?.trim() || "";
		const specificity = calculate(selector);

		if (this.shadowRoot) {
			this.shadowRoot.innerHTML = `
				<style>
					:host {
						display: inline-block;
						font-family: sans-serif;
						opacity: 0;
						transition: opacity 0.3s ease-in-out;
					}
					span {
						display: inline-block;
						padding: 2px 4px;
						margin: 0 2px;
						border-radius: 3px;
						font-weight: bold;
						color: black;
					}
					.specificity-a { background-color: #ffcccc; }
					.specificity-b { background-color: #ccffcc; }
					.specificity-c { background-color: #ccccff; }
				</style>
				<span class="specificity-a">${specificity.A}</span>
				<span class="specificity-b">${specificity.B}</span>
				<span class="specificity-c">${specificity.C}</span>
			`;
		}
	}
}

customElements.define("specificity-calc", SpecificityCalc);
