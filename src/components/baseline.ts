import "baseline-status/baseline-status.min.js";

// Wait for baseline-status to be defined and in the DOM
customElements.whenDefined("baseline-status").then(() => {
	// Find the first baseline-status element
	const baselineElement = document.querySelector("baseline-status");
	if (baselineElement) {
		const style = document.createElement("style");
		style.textContent = `
      h1, .baseline-status-title > div:not([class]), baseline-status-browsers, .open-icon {
        display: none !important;
      }
      summary {
        padding: 0 !important;
      }
      .baseline-status-browsers {
        gap: clamp(8px, 2vw, 16px) !important;
      }
      p {
        display: none !important;
      }
    `;
		// Append style directly to the baseline-status element
		baselineElement.shadowRoot?.appendChild(style);
	}
});
