# Speaker notes — "Farsi una doccia col CSS"

> Note-bullet per il parlato tra le slide. Target **~30–35 min**. Italiano.
> Ogni slide ha: ⏱ tempo · 🎯 il beat · • cosa dire · 🎬 cosa fare a schermo · → transizione.
> Tutti i fatti (commit, date, valori) sono verificati in `shower-previewer-talk.md`.

**Arco totale:** intro → il trucco (v1) → il web component live (v2) → la svolta SVG (v3) → la versione di oggi (v4) → chiusura.
Le 4 ere del previewer sono tutte montate **dal vivo** nel deck come web component: nessun server del configuratore.

---

## 0 · `index.html` — "Farsi una doccia col CSS" ⏱ ~2–3 min

🎯 Aprire con il gancio + piantare il filo conduttore (dati ≠ rappresentazione).

- Saluto + chi sono (una riga). "Oggi vi racconto la storia di **uno Shower Previewer**: il pezzo del configuratore che disegna la doccia mentre la configuri."
- Il gancio: "È iniziato con **due rettangoli e uno `skewY(30deg)`**. È finito come un **motore di rendering SVG geometrico, testato, estratto in libreria** — e oggi gira come **web component** fuori dal configuratore."
- Pre-storia (1 frase, niente slide dedicata): "Fino a fine 2024 il configuratore era solo **zanzariere e tende**: nel dump di produzione zero `shower`, zero `Dusche`. La doccia è un prodotto **nuovo del 2025** — tutto quello che vedete nasce da zero."
- Il filo da tenere a mente: "Un dettaglio architetturale che torna alla fine — la doccia esiste anche con `showerPreviewer: null`: **tutta la configurazione, zero rendering**. I dati e la loro rappresentazione sono **disaccoppiati**. Tenetelo a mente."

→ "Partiamo dall'inizio: il trucco."

---

## 1 · `shower-10-v1-skew.html` — v1, il trucco 🎨 ⏱ ~4 min

🎯 Mostrare quanto è semplice il trucco… e perché non basta. (Il "perché" del resto del talk.)

- "La primissima versione, 15 gennaio 2025, commit *moving rects around*. L'illusione 3D è **pura CSS**: due `<rect>`, uno `skewY(30deg)` e uno `skewY(-30deg)`. ~10 righe."
  ```css
  .left-face  { transform: skewY(30deg); }
  .right-face { transform: skewY(-30deg); }
  ```
- 🎬 Indicare la GIF: "Uno slider, due facce che si deformano. Per un cubo… funziona benissimo."
- **Il colpo di scena — il limite:** "Ma lo skew è **fisso a 30°**. L'ho verificato dal vivo: muovendo la larghezza da 1000 a 200, la matrice di trasformazione resta `matrix(1, 0.57735, 0, 1, 0, 0)` — cambia solo la larghezza del rettangolo, **non l'angolo**. A misure estreme la prospettiva si rompe: faccia **a spillo**."
- Beat "resilienza" (opzionale, carino): "Il giorno dopo c'è già un commit *safari fix* — lo skew dava problemi cross-browser. Primo segnale che il trucco stava tirando troppo la corda."
- Onestà: "Eppure ha **retto quasi un mese**. È cresciuto fino a una doccia completa — vetro, piatto, maniglie — sempre con `skewY`, ma guidato da una CSS variable `--skew-angle` invece che hardcoded."

→ "E quella doccia matura… oggi gira qui dentro, dal vivo. Senza nessun configuratore."

---

## 2 · `shower-20-webcomponent.html` — v2 web component LIVE ⏱ ~5 min

🎯 Primo "wow" dal vivo + la lezione Shadow vs Light DOM + un assaggio di figate CSS.

- "Questa **non è una GIF**. È la doccia dell'era CSS-transform (commit `1a7e54a28`, 12 feb, l'ultimo prima del rewrite) montata come **web component** `<shower-previewer>` — dentro le slide, zero server."
- 🎬 **Demo:** cambiare una dimensione → la doccia si rimodella. Toccare il vetro (trasparenza/satin/specchiato).
- Figate CSS da nominare mentre si tocca il vetro (scegliere 2–3, non tutte):
  - **Relative Color Syntax** ⭐: l'alpha del vetro derivata dal colore base → `rgb(from var(--glass-color) r g b / calc(var(--glass-transparency)/100))`.
  - **`backdrop-filter: blur(var(--glass-satin))`** per il satinato.
  - **CSS vars come ponte reattivo** ⭐: Vue setta `--glass-color`, `--skew-angle`, `--canvas-size`… e il CSS fa i conti con `calc()`.
- **La lezione (ottima slide tecnica):** "Per farlo girare ho imparato una cosa sui web component. Con lo **shadow DOM** di default la doccia diventava una **macchia nera** — alcuni stili/variabili globali non attraversano il confine shadow. Con **`shadowRoot: false` (light DOM)**: render perfetto."
- Il bonus del light DOM: "E siccome è light DOM, posso **stilizzarlo da fuori**: guardate, menu a sinistra e doccia a destra è un override CSS **mio, dalla slide**. Lo shadow DOM me lo avrebbe impedito. È il trade-off classico: shadow isola, light si lascia integrare."

→ "Ma il trucco dello skew, dicevamo, si rompe. Il 13 febbraio arriva il rewrite che cambia tutto."

---

## 3 · `shower-30-svg.html` — v3, la svolta SVG ⏱ ~4–5 min

🎯 Il cuore tecnico: da trucco a geometria vera. Sfatare il mito del CSS-3D.

- "Commit `5f43b01fc`, *Experiment/dynamic rendering*, #279. **3172 righe in un colpo.** Fine dello skew."
- "Da qui i vertici della doccia non sono più rettangoli deformati: sono **punti proiettati**, calcolati da una camera. **Prospettiva vera**, lati asimmetrici, niente più faccia a spillo."
  ```html
  <polygon :points="/* punti calcolati: camera + proiezione */" />
  <clipPath id="glass-path">…</clipPath>
  ```
- 🎬 **Demo:** anche questa è web component live. Cambiare le larghezze in modo **asimmetrico** → la prospettiva regge (cosa che lo skew non sapeva fare). È la prova visiva del *perché* del rewrite.
- **Mito da sfatare** (bel momento "aspettatevi il contrario"): "Vi aspettereste `transform-style: preserve-3d`, il vero CSS-3D. Cercandolo nel repo… **una sola occorrenza**, ed è il CSS di un **lightbox jQuery** ereditato dai vecchi stili, poi rimosso. Il previewer **non usa CSS-3D**: i `rotateY(180deg)` che trovate sono semplici *flip* 2D per specchiare le maniglie. Tutta la profondità è **matematica di proiezione in SVG**."
- Ponte verso l'integrazione (carrellata veloce, niente slide): "Da esperimento, l'era successiva lo trasforma in feature: **connesso** alla config vera, **porte**, **glass art**, **piatto doccia**, perfino la **generazione dell'immagine** per il carrello (SVG → canvas → JPEG). Una citazione dal log che adoro: un commit intitolato *Fuck imperative, go Pattern matching*."

→ "E arriviamo a oggi."

---

## 4 · `shower-40-modern.html` — v4, la versione di oggi + chiusura ⏱ ~5 min

🎯 Maturità (libreria/test/sloped) + il finale che richiude il cerchio.

- "Stesso motore, ma **estratto** da `frontend/` in un pacchetto condiviso `components/`: geometria pura in `useShowerPreviewMath.ts`, **test** accanto, e le **pareti inclinate** (sloped walls)."
- 🎬 **Demo:** è la più ricca — 44 controlli, form moderna. Mostrare *Panel shape → sloped* e *Top width*: le pareti si inclinano. Anche questa **web component, dal vivo**.
- **Il richiamo al filo conduttore (la chiusura forte):** "Ricordate `showerPreviewer: null`? Dati e vista **disaccoppiati**. È **la stessa proprietà** che ha permesso al componente di evolvere per un anno e mezzo — skew → transform → SVG → libreria — **senza mai toccare i dati**. Ed è **la stessa proprietà** che lo rende esportabile come web component: niente Pinia, niente router, niente API. Unica prop pubblica: `inputs`."
- **Verdetto:** "Il web component non è un 'si potrebbe', è **un fatto**: l'ho dimostrato dal vivo su **quattro** versioni diverse, e le avete viste tutte girare in queste slide senza nessun configuratore acceso."
- Onestà tecnica (1 riga, fa scena): "L'unico vero ostacolo? La form moderna usa `useIntl`, e i web component **non ereditano il contesto Vue** → bastava un `provideIntl`. Trade-off noti, non magia."
- Chiusura: "Da `skewY(30deg)` al web component. La morale: **disaccoppiare i dati dalla rappresentazione** ti compra evoluzione *e* portabilità. Grazie." + contatti.

---

## Bonus · `shower-50-test.html` — "E ora si testa" ⏱ ~2–3 min (dopo le figate, prima dei contatti)

🎯 Pagare il seme di v1-limiti ("la matematica va estratta in JS per poterla provare") e richiudere il filo *dati ≠ rappresentazione* sul versante test. Slide bonus: se il tempo stringe, una frase e via.

- Aggancio: "Ricordate il limite del CSS — un `calc()` non lo testi? Estratta la matematica in JS, è diventata una **piramide di test**."
- **1 · Unit, funzioni pure**: "`calculatePoint`, `pickVisibleSide`, `normalizeDoorsWidth`: proiezione e geometria **senza una riga di Vue**. 18 test Vitest, in isolamento." (`components/src/ShowerPreviewer/useShowerPreviewMath.test.ts`)
- **2 · Snapshot quasi gratis** ⭐ (il punto non-ovvio): "L'output è **SVG serializzabile** — lo stesso fatto che dà export web component e thumbnail JPEG. Quindi snapshot = confrontare l'`outerHTML` con `toMatchFileSnapshot()`. 9 configurazioni congelate." (`ShowerPreviewerComponent.test.ts` + `__snapshots__/*.svg`, `happy-dom`, `ResizeObserver` stubbato a `containerWidth=800`)
- **3 · e2e stretto di proposito**: "Playwright, browser vero, **un** solo smoke — copre l'unica cosa che lo unit pinna via: lo scaling **live** del clip-path del vetro col container reale. La coverage vera vive negli snapshot unit." (`e2e/tests/shower-previewer-snapshots.spec.ts`)
- Chiusura del beat: "Ogni livello prova la **rappresentazione** senza toccare i dati. È lo stesso disaccoppiamento di tutto il talk."

🎬 Niente demo live qui (sono test, non render): è una slide di concetti, fragments che salgono dal basso. → contatti.

---

## Appendice — se avanza tempo / Q&A

- **Slide bonus "Le figate CSS"** (da costruire): Relative Colors, gradiente specchiato iridescente, noise + `mix-blend-mode: multiply`, vignette via `mask: radial-gradient`, `clip-path: url(#glass-path)`, SVG `feGaussianBlur`, `drop-shadow()`.
- **Slide confronto** (TODO): le 4 versioni affiancate skew → transform → svg → modern.
- Domande probabili: perché non Three.js/WebGL? (→ SVG già serializzabile, niente shadow-DOM/WebGL da gestire, cattura immagine gratis). Performance del bundle? (~1–1.7MB, gzip ~600KB, light DOM).

## Cue tecnici per il presenter
- Dev server: `:5180` (`pnpm dev`). Frecce ←/→ per navigare; ↑/↓ scrollano dentro la slide.
- Le demo live sono **veri input**: prova prima i valori "estremi" che vuoi mostrare (faccia a spillo su v1-concept, asimmetria su v3, sloped su v4).
- Bundle pesanti (~1.7MB v4): **precarica** ogni slide prima di parlarci sopra (il prefetch del `nav-component` aiuta, ma dai un secondo).
