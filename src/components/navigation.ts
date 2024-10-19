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

// biome-ignore lint/suspicious/noExplicitAny: new API, TODO UPDATE TYPES
(window as any).addEventListener("pageswap", async (e: PageSwapEvent) => {
	if (e.viewTransition) {
		const transitionType = determineTransitionType(e.activation.entry);
		console.log(`pageSwap: ${transitionType}`);
		localStorage.setItem("transitionType", transitionType);
		e.viewTransition.types.add(transitionType);
	}
});

// biome-ignore lint/suspicious/noExplicitAny: new API, TODO UPDATE TYPES
(window as any).addEventListener("pagereveal", async (e: PageSwapEvent) => {
	if (e.viewTransition) {
		const transitionType = localStorage.getItem("transitionType");

		console.log(`pageReveal: ${transitionType}`);
		e.viewTransition.types.add(transitionType || "unknown");
	}
});

const determineTransitionType = (entry: { url: string }) => {
	const toUrl = new URL(entry.url);
	const backUrl = new URL(document.referrer || window.location.href);

	const toPath = toUrl.pathname;
	const backPath = backUrl.pathname;

	console.log({ toPath, backPath });
	if (toPath === backPath) {
		return "backwards";
	}

	return "forwards";
};
