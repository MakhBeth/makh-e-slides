declare const navigation: any

window.addEventListener("pageswap", async (e: any) => {
	e?.viewTransition.types.add('backwards');
	console.log(Array.from(e.viewTransition.types))
  if ((e as any).viewTransition && navigation) {
  }
})
