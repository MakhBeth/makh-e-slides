document.addEventListener("click", (e) => {
	const target = e.target as HTMLElement;
	if (target && target.tagName === "A" && target.getAttribute("href")) {
		console.log("Link clicked:", target.getAttribute("href"));
		const href = target.getAttribute("href");
		if (document.startViewTransition) {
			e.preventDefault();
			e.stopPropagation();
			document.startViewTransition(() => {
				window.location.href = href || "";
			});
		}
	}
});
