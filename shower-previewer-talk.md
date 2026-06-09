# Talk — Lo Shower Previewer del Configurator

> Bozza in markdown con **tutte le scoperte** ricavate dalla history git del progetto `configurator`.
> Serve a iterare sul contenuto prima di trasformarlo in slide HTML (`src/slides/`).
> Tutti i commit, le date e gli snippet qui sotto sono verificati dalla history.

---

## 🏷️ Convenzioni di naming (faremo MOLTE versioni)

Ogni versione del previewer = un **commit/era** con uno **slug stabile**:

| slug | commit | era |
|------|--------|-----|
| `v1-skew` | `4da6409ba` | skewY fisso, "Hello World" |
| `v2-transform` | `1a7e54a28` | CSS-transform matura (full shower, controlli) |
| `v3-svg` | `5f43b01fc` (#279) | proiezione SVG calcolata |
| `v4-modern` | branch recente | componente estratto in `components/` |

File (in `makh-e-slides/`):
- **Bundle web component** → `public/shower/<slug>.wc.js` (es. `public/shower/v2-transform.wc.js`)
- **GIF** → `public/shower/<slug>.<aspetto>.gif` (es. `v2-transform.dimensions.gif`, `v1-skew.resize.gif`)
- **Slide** → `src/slides/shower-<nn>-<topic>.html` (flat: l'MPA legge `src/slides/*.html` **non** ricorsivo)

Build (nel repo `configurator`):
- **Worktree per versione** → `configurator-wc-<slug>` (es. `configurator-wc-v2-transform`, su quel commit)

---

## 🎯 Il messaggio del talk

> Come un **esperimento da due rettangoli e uno `skewY(30deg)`** è diventato un
> **motore di rendering SVG geometrico, testato, estratto in libreria** — e perché
> oggi può vivere come **web component** completamente staccato dal configuratore.

Tema architetturale di fondo che lega tutto: **la configurazione (i dati) e la sua
rappresentazione (il previewer) sono disaccoppiate.** Questo spiega sia l'evoluzione
sia la fattibilità del web component.

---

## 🕰️ La timeline completa (le "ere")

| # | Tappa | Quando | Commit chiave | Tecnica |
|---|-------|--------|---------------|---------|
| **0** | **Nessuna doccia** | fino a dic 2024 | `migrationDump/configurators.json` | il configuratore è solo **zanzariere e tende** |
| **1** | **Doccia come pura config** | gen 2025 | campo `showerPreviewer: null` | esiste come *dati/form*, senza alcun rendering |
| **2** | **Skew prototype** 🎨 | 15 gen 2025 | `4da6409ba` *moving rects around* | `<rect>` + **CSS `skewY(±30deg)`** = falso cubo 3D |
| **2b** | **Era CSS-transform matura** ⭐ | 15 gen → 12 feb 2025 | culmina in `1a7e54a28` (*ultimo prima dell'SVG*) | la doccia cresce (vetro, piatto, maniglie, colori) ma **sempre con `skewY`/`rotateY`/`translateY`** guidati da `--skew-angle` |
| **3** | **Dynamic rendering** | 13 feb 2025 | `5f43b01fc` (#279) | rewrite: **punti di proiezione calcolati** in SVG, fine dello skew, rinominato `ShowerPreviewer` |
| **4** | **Connesso → integrato** | mar–dic 2025 | `d6954c671` (#303) … `69e346dc9` (#599) | porte, glass art, piatto doccia, immagine carrello, focus |
| **5** | **Libreria condivisa + sloped** | apr–mag 2026 | `342d30767` (#737), `45ea1406e` (#789) | estratto in `components/`, testato, pareti inclinate |
| **6** | **(Proposta) Web Component** | → futuro | — | `<shower-previewer>` staccato dal configuratore |

Distribuzione del lavoro nel tempo (commit/mese sul previewer): picco a **set 2025 (22)**,
poi ott 2025 (12), e nuova ondata mag 2026 (9, le sloped walls).

---

## 0. Pre-2025: la doccia non esisteva

Il dump di produzione **`migrationDump/configurators.json`** (commit `0f0d7b93f`, 24 dic 2024)
è interamente **zanzariere, tende e infissi**. Zero occorrenze di `shower` / `Dusche` / `Glas`.

Titoli realmente presenti nel dump:

```
Spannrahmen außen / innen      (telai a tensione)
Schiebetür ein-/zwei-/vierflüglig   (porte scorrevoli)
Rollo / Rollo Sky / Rollo Comfort   (tende a rullo)
Plisseetür / Plisseetür Slim        (porte plissettate)
Pollenschutzgewebe                  (rete antipolline)
studioLINE Kollektion 2022 / 2023-2025
```

➡️ **La doccia è un prodotto nuovo del 2025.** Tutto quello che segue nasce da zero.

---

## 1. La doccia come pura configurazione (`showerPreviewer: null`)

Scoperta architetturale chiave: nel modello dati ogni `Configurator` ha un campo
**nullable** `showerPreviewer`. Il previewer è quindi un **layer opzionale e staccabile**.

**Configuratore SENZA previewer** (es. la config "Blizz Navigation", e il test `title-value-display`):

```json
{
  "title": "Blizz Navigation",
  "showerPreviewer": null,
  "dxfConfig": null,
  "basePrice": 0
}
```

**Configuratore CON previewer** (fixture in `api/.data/...Configurators.json`):

```json
{
  "showerPreviewer": {
    "enabled": false,
    "height": null,
    "width": null,
    "sides": 2,
    "showerTray": { "...": "..." }
  }
}
```

➡️ Una doccia può esistere con **tutta la sua struttura** (gruppi, opzioni, dimensioni,
vetro, porte) e `showerPreviewer: null` → **solo il form, nessun rendering**.
Il previewer è una *vista* che si accende via quel campo, **non** è parte della configurazione.

> Nota onesta per il talk: nelle fixture versionate `enabled` è sempre `false` (sono test,
> soprattutto DXF, che portano solo l'oggetto di default). Le docce "accese" (`enabled: true`)
> vivono nel DB di produzione, non nei JSON del repo.

Anche il **nome del campo segue il componente**: nasce come `Previewer`, poi rinominato in
`ShowerPreviewer` (commit `e0e56067e` *"Rename Previewer to ShowerPreviewer"*).

---

## 2. Lo skew prototype — la vera v1 🎨

**Cartella:** `frontend/src/components/AppConfigurator/Previewer/` (singolare `Previewer`!)
**Commit genesi:** `4da6409ba` — *"feat: moving rects around"* — **15 gennaio 2025**

L'illusione 3D era ottenuta **puramente con CSS skew** su due facce `<rect>`:

```css
.cube-face  { stroke: #7e9b89; fill: none; }
.left-face  { transform: skewY(30deg); }
.right-face { transform: skewY(-30deg); }
```

```html
<rect class="cube-face left-face"  x="500" y="750" :width="leftWidth" height="2000"
      transform-origin="1500 1500" />
<rect class="cube-face right-face" :x="500 + parseInt(leftWidth)" width="1000" height="2000"
      transform-origin="1500 1500" />
```

File del prototipo:
- `Previewer.vue` → wrapper "Hello World"
- `Sample.vue` → il cubo skew (sopra), un solo input `leftWidth`
- `Sample2.vue` → versione più elaborata (2199 righe)

➡️ **Punto perfetto per la slide d'apertura "il trucco".** ~10 righe di CSS per fingere
la prospettiva. Funziona per un cubo, ma…

---

## 2b. L'era CSS-transform matura — fino all'ultimo commit prima dell'SVG ⭐

> ⚠️ Correzione importante: lo skew **non** viene abbandonato dopo 48h. La tecnica
> "CSS-transform" (skew/rotate/translate) **regge per quasi un mese** e cresce fino a una
> doccia completa. Solo il rewrite `#279` (13 feb) la sostituisce con la proiezione calcolata.

Progressione completa dell'era transform (tutto in `Previewer/` → poi `ShowerPreviewer/`):

| Commit | Data | Cosa |
|--------|------|------|
| `4da6409ba` | 15 gen | v1 skew fisso, "Hello World", 2 `<rect>` (**quella che gira a `?route=previewer`**) |
| `fec2ef917` | 16 gen | *adds svg walls and edge* |
| `d2927b824` | 16 gen | *safari fix* ← lo skew dava problemi cross-browser (bel beat "resilience") |
| `06af0c80a` | 16 gen | *floor* |
| `af8877666` | 17 gen | *simplifies math* |
| `dfa950adb` | 17 gen | *refactor to simulate 3d* |
| `32c46617f` | 18 gen | *math done* (+ `50de75585` *sexy*) |
| `8de462506` | 20 gen | *adds noise* |
| `3d906c218` | 20 gen | *adds blocks* (maniglie) |
| `b73e2e9ae` | 21 gen | *adds color* |
| `a954f99e1` | 21 gen | *adds height* |
| `042674768` | 24 gen | *start working on tray* (piatto doccia) |
| `10a7414f0` | 3 feb | *adds handle* |
| `a80eca7c5` | 5 feb | *adds satin* |
| `efbdc4f28` | 5 feb | *adds mirrored glass* |
| `e0e56067e` | 6 feb | **Rename `Previewer` → `ShowerPreviewer`** (prepara il refactor) |
| **`1a7e54a28`** | **12 feb** | **⭐ ULTIMO prima dell'SVG** — doccia completa, ancora in transform |

A `1a7e54a28` il rendering è ancora questo (`Shower.vue`):

```css
.left-wall  { transform: skewY(calc(var(--skew-angle) *  1deg)); }
.right-wall { transform: skewY(calc(var(--skew-angle) * -1deg)); }
.handle     { transform: rotateY(180deg); }
.tray       { transform: translateY(calc(var(--shower-tray-height) * -1px)); }
```

Differenza con la v1: lo skew non è più hardcoded a 30°, ma guidato dalla CSS variable
**`--skew-angle`**. La route `?route=previewer` qui renderizza `<Wrapper />` (doccia vera con
pannello controlli: dimensioni, vetro, piatto, porte), non più "Hello World".

➡️ **Il messaggio**: il trucco ha retto sorprendentemente a lungo. Il rewrite `#279` arriva
solo quando servono prospettive che lo skew fisso non sa fare (lati asimmetrici, inclinazioni).

---

## 3. Dynamic rendering — nasce `ShowerPreviewer` (#279)

**Commit `5f43b01fc` — "Experiment/dynamic rendering" — 13 feb 2025.**
3172 righe in un colpo. Rinomina `Previewer/` → `ShowerPreviewer/`.

Da qui il rendering è **SVG puro con proiezione prospettica reale** (niente più skew):

```html
<!-- Background.vue -->
<svg id="background" :viewBox="`0 0 ${canvasSize} ${canvasSize}`">
  <clipPath id="glass-path">
    <polygon :points="/* punti calcolati con camera + proiezione */" />
  </clipPath>
</svg>
```

I `rotateX/Y(180deg)` che si trovano qui **non sono CSS-3D**: sono semplici *flip* 2D
per specchiare maniglie/elementi.

> ⚠️ Mito da sfatare nel talk: cercando `transform-style: preserve-3d` nel repo si trova
> **una sola occorrenza**, ma è il CSS di un lightbox jQuery (`jquery.fancybox.min.css`)
> ereditato dai vecchi stili Hausfux (#18, gen 2023), rimosso nel 2024. **Non** è il previewer.

---

## 4. Da componente a feature: connesso e integrato (2025)

La lunga serie *"integration three… eight… ten"* trasforma l'esperimento in feature reale:

| Commit | Cosa aggiunge |
|--------|---------------|
| `d6954c671` (#303) | **connected** — prima volta che legge la configurazione vera |
| `054f031ec` (#364) | controlli del **piatto doccia** (shower tray) |
| `5246e77f4` (#414), `e31588e80` (#435) | **glass art** / decori immagine sul vetro |
| `9df66d0be` (#420) | **porte** |
| `675e30206` (#528) | **focus options** (evidenzia elementi) |
| `0d80e66c5` (#586) | **generazione immagine** del preview per il carrello |
| `69e346dc9` (#599) | **release shower previewer** (dic 2025) |
| `52ab49fd3` (#607) | integrazione del componente per la visualizzazione immagine |

Citabile: `cfffd9a46` *"Fuck imperative, go Pattern matching"* — refactor del posizionamento porte.

---

## 5. Maturità: estrazione in libreria + pareti inclinate (2026)

**Commit `342d30767` (#737) — "slope showers - previewer base" — 11 mag 2026.**

Il previewer viene **estratto** da `frontend/` a un pacchetto condiviso
**`components/src/ShowerPreviewer/`**, con:

- **Geometria pura**: `useShowerPreviewMath.ts` (~42k), `backgroundGeometry.ts`
- **Test**: `useShowerPreviewMath.test.ts`
- **Pareti inclinate** (sloped walls): `OneSideSlopedWall.vue`, e il fix
  `45ea1406e` (#789) *"merge sloped walls into shared ridge when heights differ"*
- **Cattura immagine**: `captureShowerPreview.ts` (SVG → canvas → JPEG/blob)

Struttura attuale della cartella:

```
components/src/ShowerPreviewer/
├── ShowerPreviewerComponent.vue   ← componente top-level (prop: inputs)
├── Shower.vue  Background.vue  Defs.vue  Controls.vue
├── OneSideWalls.vue  OneSideSlopedWall.vue  BGMask.vue  GradientDef.vue
├── useShowerPreviewMath.ts (+ .test.ts)   ← motore geometrico
├── backgroundGeometry.ts  buildCanvasStyle.ts  svgUtils.ts
├── captureShowerPreview.ts  fetchImageAsBase64.ts  animationsUtilities.ts
├── showerPreviewConstants.ts (242k)  defaults.ts
└── assets/
```

---

## 6. La proposta: esportarlo come Web Component ⭐

**Verdetto: si può, ed è quasi gratis — l'infrastruttura esiste già.**

### Perché è facile

1. **Il progetto ESPORTA GIÀ web component.** In `frontend/src/wc.ts`:
   ```ts
   defineCustEl("configurator-portal", PortalCeVue)
   defineCustEl("configurator-configurator", ConfiguratorVue)
   defineCustEl("configurator-cart", AppConfiguratorCart)
   defineCustEl("configurator-project-list", AppProjectListCe, { /* router */ })
   ```
   C'è già l'helper `defineCustEl` + `configureCE` + un HOC (`CustElHoc`) costruito su
   `defineCustomElement` di Vue (`frontend/src/internal/setupCE.ts`). Aggiungere
   `<shower-previewer>` è **lo stesso pattern**.

2. **È già un componente isolato e "puro".** Unica prop pubblica:
   ```ts
   defineProps<{ inputs: Partial<ShowerPreviewInputs.Encoded> }>()
   ```
   Niente Pinia, niente router, niente `inject()` di app-state, niente chiamate API.
   L'unico runtime è `makeRunPromise(Context.empty())` → **contesto vuoto**, usato solo
   per convertire immagini in base64.

3. **È SVG puro** → già serializzabile (lo dimostra `captureShowerPreview.ts`).
   Nessun WebGL/Three.js da gestire in shadow DOM.

4. Esiste già una **pagina standalone** `frontend/src/pages/ShowerPreviewer.vue` che
   monta solo `<ShowerPreviewer />` senza il resto del configuratore.

### L'unico vero accorgimento

La prop `inputs` è un **oggetto**: i custom element passano gli attributi come stringhe,
quindi va settato come *property* JS (`el.inputs = {...}`) o passato come JSON-attribute.
È l'unico dettaglio non banale.

### Demo finale "wow"

`<shower-previewer>` montato in una pagina HTML vuota, **fuori dal configuratore**,
che reagisce dal vivo a `inputs` cambiati dalla console.

➡️ Chiude il cerchio col messaggio: la rappresentazione è disaccoppiata dai dati →
**la stessa proprietà che ha guidato l'evoluzione rende possibile il web component.**

---

## ✅✅ Web Component — PROVATO DAL VIVO (anche sulla versione `1a7e54a28`!)

**Non solo il previewer moderno: anche la versione CSS-transform di `1a7e54a28` si esporta come
web component, e l'abbiamo verificato dal vivo nel dev server.**

Perché funziona già a quel commit:
- `Wrapper.vue` chiama `useContext()` (schema `ShowerPreviewInputs` + default **in locale**) e fa
  `provide("context", …)`; i figli (`Controls`, `Shower`, `Background`) fanno `inject`. **Zero stato globale.**
- `Controls.vue` usa **solo input nativi** (`<input>`, `<select>`) → niente PrimeVue da iniettare.
- Dipendenze esterne totali: `vue`, `effect-app` (Schema), `@/internal/client` (`buildFormFromSchema`).

Entry usato (file temporaneo, poi rimosso):
```ts
import { defineCustomElement } from "vue"
import Wrapper from "./components/AppConfigurator/ShowerPreviewer/Wrapper.vue"
customElements.define("shower-previewer", defineCustomElement(Wrapper, { shadowRoot: false }))
```

Caricato live via Vite dalla console e montato su `document.body` svuotato:
```js
await import('/configurator-app/src/shower-wc-live.ts')
document.body.innerHTML = ''
document.body.appendChild(document.createElement('shower-previewer'))
```

### ⚠️ Lezione chiave (ottima slide): Shadow DOM vs Light DOM
- **`defineCustomElement(Wrapper)` default (shadow DOM)** → struttura e controlli OK, ma la doccia
  diventa una **macchia nera**: alcune variabili/stili CSS globali **non attraversano il confine shadow**.
- **`defineCustomElement(Wrapper, { shadowRoot: false })` (light DOM)** → **render perfetto**, identico
  alla route, controlli pienamente funzionanti, **fuori dal configuratore su pagina vuota**.

➡️ Il classico trade-off dei web component: lo shadow DOM isola (bene per il consumatore, male se il
componente dipende da stili globali). Per questo previewer la scelta giusta è **light DOM**.

> Verdetto: l'export a web component **non è un "si potrebbe", è un fatto** — dimostrato su due
> versioni diverse (skew-transform `1a7e54a28` e moderna). Materiale perfetto per il finale dal vivo.

---

## 🚀🚀 Web Component DENTRO LE SLIDE — FATTO

**Il web component è ora incorporato nel deck come bundle self-contained.** Slide:
`src/slides/shower-90-webcomponent.html` → carica `/shower/v2-transform.wc.js` (in `public/shower/`)
e renderizza `<shower-previewer>` interattivo, **senza alcun server del configuratore**.

Verificato live: `defined: true`, SVG renderizzato, 13 input interattivi, caricato dal bundle del deck.

### Come è stato buildato (worktree `configurator-wc-v2-transform` su `1a7e54a28`)
1. **Entry** `frontend/src/shower-wc-build.ts`:
   ```ts
   import { defineCustomElement } from "vue"
   import Wrapper from "./components/AppConfigurator/ShowerPreviewer/Wrapper.vue"
   customElements.define("shower-previewer", defineCustomElement(Wrapper, { shadowRoot: false }))
   ```
2. **Shim** `frontend/src/shim-client.ts` — evita il pesante `@/internal/client` (makeClient,
   runtime, primevue) prendendo solo la funzione pura:
   ```ts
   export { buildFormFromSchema } from "@effect-app/vue/form"
   ```
3. **Config** `vite.shower-build.config.ts` — lib IIFE, alias (`@/internal/client`→shim, `@`→src,
   `#resources`/`#models`), `unplugin-vue-components` (per i sotto-componenti auto-importati come
   `Background`, `Shower`, `Controls`, `TextField`), `assetsInlineLimit: ∞` (inline noise.jpg).
4. **Bundle finale**: CSS (`frontend.css`) + JS uniti in un file; prepend di uno shim
   `window.process = { env: { NODE_ENV: 'production' } }` (Vue/effect-app referenziano `process`).
   → `public/shower/v2-transform.wc.js` (~1MB, gzip ~600KB).

### Trappole incontrate (ottime per le slide "lessons learned")
- **Shadow DOM** → doccia macchia nera; serve **`shadowRoot: false`** (light DOM).
- **`process is not defined`** → i bundle Vue/effect-app si aspettano `process.env`; shim nel prelude.
- **Componenti auto-importati** (`unplugin-vue-components`) → vanno replicati nella config di build,
  altrimenti `<Background>`, `<Shower>`, `<TextField>` non si risolvono.
- **`@/internal/client` pesante** → shim verso la funzione pura `@effect-app/vue/form`.

### Rebuild
```bash
cd /Users/davidedipumpo/Projects/configurator-wc-v2-transform
node_modules/.bin/vite build --config vite.shower-build.config.ts
# poi unisci css+js+process-shim e copia in makh-e-slides/public/shower/v2-transform.wc.js
```

### 🎨 CSS override dall'esterno (light DOM) — FUNZIONA
Slide `src/slides/shower-90-webcomponent.html`. Struttura interna del componente:
`shower-previewer › .sample › .controls` (menu) `+ .wrapper` (doccia SVG).
Essendo **light DOM**, la stiliamo da fuori → **menu a sinistra, doccia a destra**:
```css
shower-previewer .sample   { display: flex; gap: 1rem; height: 100%; }
shower-previewer .controls { flex: 0 0 320px; overflow: auto; }   /* menu sinistra */
shower-previewer .wrapper  { flex: 1 1 auto !important; width: auto !important; } /* doccia destra */
```
➡️ Punto da sottolineare nel talk: **lo shadow DOM avrebbe impedito questo override**; il light DOM
lo rende possibile. Trade-off da raccontare.

---

## 🧩 Idee per la struttura delle slide (da iterare)

1. **Titolo** — "Da `skewY(30deg)` al web component: storia di uno Shower Previewer"
2. **Pre-storia** — il configuratore prima: solo zanzariere (screenshot dump)
3. **Il trucco** — le ~10 righe di CSS skew (`Sample.vue`, 15 gen 2025) + render
4. **Perché non bastava** — config = larghezze diverse → lo skew si rompe (+ safari fix)
5. **La svolta** — SVG + proiezione calcolata (#279)
6. **Da esperimento a feature** — porte, vetro, piatto, immagini carrello (carrellata)
7. **Maturità** — estrazione in libreria, test, sloped walls (2026)
8. **Il pattern nascosto** — `showerPreviewer: null` → dati e vista disaccoppiati
9. **Il finale** — `<shower-previewer>` web component, demo dal vivo
10. **Chiusura** — il disaccoppiamento come filo conduttore

### Asset da catturare
- [ ] Screenshot dump pre-2025 (titoli zanzariere)
- [x] **GIF v1 skew** → `public/shower/v1-skew.resize.gif` (820×823) — `4da6409ba`: "Hello World" + slider che deforma il cubo. `skewY(±30deg)` **fisso** → il limite.
- [x] **GIF v2 dimensioni** → `public/shower/v2-transform.dimensions.gif` (~2.4MB) — `1a7e54a28`: cambio larghezze/lati → la doccia si rimodella.
- [x] **GIF v2 vetro** → `public/shower/v2-transform.glass.gif` (~1.9MB) — `1a7e54a28`: trasparenza/satin/**vetro specchiato**.
- [x] **GIF web component** → `public/shower/v2-transform.webcomponent.gif` (~3.9MB) — `<shower-previewer>` montato fuori dalla route Vue.
- [x] **Bundle WC + slide** → `public/shower/v2-transform.wc.js` + `src/slides/shower-20-webcomponent.html` (con CSS override menu-sx/doccia-dx).
- [x] **Bundle WC + slide v3** → `public/shower/v3-svg.wc.js` + `src/slides/shower-30-svg.html` (proiezione SVG calcolata, stesso CSS override).
- [x] **Bundle WC + slide v4** → `public/shower/v4-modern.wc.js` + `src/slides/shower-40-modern.html` (componente moderno estratto, pareti inclinate, 44 input; serve `provideIntl`).
- [ ] Comprimere le GIF (~2-4MB) con `gifsicle` prima del deck finale

> Nota: le GIF v2 pesano ~2MB (nessun `gifsicle` disponibile per comprimerle ora). Da ottimizzare prima del deck finale (es. `gifsicle -O3 --lossy=80` o ridurre i frame).

### Nota tecnica verificata dal vivo (per la slide "il limite")
Muovendo "Left face width" da 1000 → 200, la matrice di trasformazione resta `matrix(1, 0.57735, 0, 1, 0, 0)`: **lo skew è bloccato a 30°**, solo la larghezza del `<rect>` cambia. Risultato: a larghezze estreme la prospettiva si rompe (faccia a spillo). È la prova visiva del perché si è passati ai punti di proiezione calcolati.

---

## 🗓️ Stato del deck (aggiornato 2026-06-07)

Repo `makh-e-slides` ripulito (rimosso il vecchio talk "Frontend Resilience"). Slide attuali:

1. `index.html` — **intro**: "Farsi una doccia col CSS"
2. `shower-10-v1-skew.html` — **v1**: GIF dello skew (`public/shower/v1-skew.resize.gif`)
3. `shower-20-webcomponent.html` — **v2**: web component live + CSS override (menu-sx / doccia-dx) → `to` shower-30
4. `shower-30-svg.html` — **v3**: web component `v3-svg` live, proiezione SVG calcolata (skew → punti proiettati), stesso CSS override → `to` shower-40
5. `shower-40-modern.html` — **v4**: web component `v4-modern` live (componente estratto in `components/`, pareti inclinate, 44 input), stesso CSS override

Branding aggiornato in `src/template.html` (titolo/footer). Dev server: `pnpm dev` / `vite` su `:5180`.

### ✅ v3-svg — web component FATTO (2026-06-07)
Verificato live su `:5180`: `defined: true`, light DOM `.sample`, **13 input** interattivi, **3 `<svg>` / 52 shape**
renderizzate, doccia con **prospettiva vera** (due pareti che convergono su un angolo di fondo — impossibile col
solo skew). Nessun errore in console. CSS override (menu-sx / doccia-dx) funziona come per v2.
Bundle: `public/shower/v3-svg.wc.js` (~1.04MB). Slug `v3-svg`, commit `5f43b01fc` (#279).

### ✅ v4-modern — web component interattivo FATTO (2026-06-07)
Verificato live su `:5180`: `defined: true`, **44 input** (form moderna OmegaForm con i controlli pareti
inclinate: Panel shape, Top width left/right, Hidden side, Detached), **8 `<svg>` / 77 shape**, doccia con
prospettiva piena. **Reattività confermata**: cambiando "Left shape width" 800→400 la geometria proiettata
si ricalcola. CSS override (menu-sx / doccia-dx) adattato al DOM moderno (`.previewer › .omega-form-flex ›
Controls + .showerPreviewer`). Bundle: `public/shower/v4-modern.wc.js` (~1.72MB). Commit `c8ac5d503` (#828,
HEAD attuale, con sloped walls).

⚠️ **Lezione build v4 (la "build da verificare")**: il componente moderno (`frontend/.../ShowerPreviewer.vue`
→ `Wrapper` → `Controls` con `useForm` di `@effect-app/vue-components`) usa una **OmegaForm** che chiama
`useIntl()` → fallisce con **"useIntl must be used within a IntlProvider"** in un custom element isolato
(i web component NON ereditano il contesto dell'app Vue). Fix: entry minimale che fa `provideIntl(useIntl)`
dentro un HOC (vedi `frontend/src/internal/setupCE.ts` `setupEnv` per il pattern completo — qui basta l'intl,
niente PrimeVue / vue-query / nav). Deps: `pnpm install --frozen-lockfile` nel worktree (era == main, vite 8).
Build config: alias `vue→esm-bundler`, `#resources/#models/#components`, `@→frontend/src`, + `tsconfigPaths()`.

⚠️ **Lezione deps (importante per v3/v4)**: il symlink `node_modules → configurator/node_modules` **non basta più**.
Dal 2-giu il repo `configurator` principale è passato a **effect 4.0 beta / `@effect-app/vue@4.0.0-beta.262`**,
che **non esporta più `buildFormFromSchema`** (usato da `useContext.ts` via shim). Il commit v3 (e v2) vuole
`@effect-app/vue@^2.24.3` + `effect@^3.12.10`. Fix: nel worktree, **`pnpm install --frozen-lockfile`** dedicato
(era-correct, ~12s, vite 6.1.0) invece del symlink. Build poi OK (solo warning cosmetici di CSS nesting).

---

## 🚧 PROSSIMI STEP

### A. Le altre versioni, sempre come web component (stessa pipeline)
Per ognuna: worktree `configurator-wc-<slug>` sul commit → build → `public/shower/<slug>.wc.js` → slide.

- [x] **v3-svg** (`5f43b01fc`, #279, 13 feb 2025) — **prima versione SVG con proiezione calcolata**.
      Slide `shower-30-svg.html`. Mostra il salto skew → punti proiettati. Web component. ✅ FATTO e verificato live.
      Worktree `configurator-wc-v3-svg` con `pnpm install --frozen-lockfile` dedicato (vedi "Lezione deps" sopra).
- [x] **v4-modern** (`c8ac5d503`, #828, HEAD attuale) — **ultima versione** (estratta in `components/`, sloped
      walls, testata). Slide `shower-40-modern.html`. Web component interattivo. ✅ FATTO e verificato live.
      Worktree `configurator-wc-v4-modern`. Risolto il "build da verificare": serviva `provideIntl` (vedi
      "Lezione build v4" sopra), non un problema di `SchemaTransformation`.
- [ ] Slide di confronto finale: le 4 versioni affiancate (skew → transform → svg → modern).

### B. Slide "Le figate CSS" — documentare le tecniche usate
Tutte verificate nel codice `ShowerPreviewer` (`1a7e54a28`). Da trasformare in una/più slide:

| Tecnica | Dove | Snippet |
|---------|------|---------|
| **Relative Color Syntax** ⭐ | `Wrapper.vue` glass-traits | `background-color: rgb(from var(--glass-color) r g b / calc(var(--glass-transparency) / 100))` — l'alpha del vetro derivato dal colore base + slider trasparenza |
| **backdrop-filter (satin)** | `Wrapper.vue` | `backdrop-filter: blur(var(--glass-satin))` — vetro smerigliato guidato da una CSS var |
| **Gradiente "specchiato"** | `Wrapper.vue .mirrored` | `linear-gradient(-45deg, var(--a), var(--b), var(--a), …)` con `--a:white; --b:rgba(150,190,205,1)` — effetto iridescente |
| **Noise + blend** | `Background.vue` / `Wrapper.vue` | `background-image: var(--noise-texture); opacity:.1; mix-blend-mode: multiply` (+ `fill:url(#noisePattern)`) |
| **Vignette via mask** | `Wrapper.vue .noise-overlay` | `mask: radial-gradient(circle, black 50%, transparent 70%)` — dissolve il rumore ai bordi |
| **Light dominance** | `Background.vue` | `fill: blue; opacity:.1; mix-blend-mode: multiply` — tinta luce ambiente |
| **clip-path SVG** | `Wrapper.vue` glass-traits | `clip-path: url(#glass-path)` — ritaglia il vetro sulla forma |
| **SVG filters (blur)** | `Background.vue`, `OneSideWalls.vue` | `filter: url(#blur3…#blur8)` (feGaussianBlur) — ombre morbide / profondità |
| **drop-shadow()** | vari | `filter: drop-shadow(0 15px 15px rgba(0,0,0,.37))` |
| **CSS vars come ponte reattivo** ⭐ | `Wrapper.vue` (`canvasStyle`) | `--glass-color/-transparency/-satin`, `--skew-angle`, `--canvas-size`, `--parallax-delta-px`, `--camera-x-px` settate da Vue → il CSS fa i conti con `calc()` |
| **transform 3D "finto"** | `Shower.vue` | `skewY(calc(var(--skew-angle)*1deg))`, `rotateY(180deg)`, `translateY(...)` |
| **calc() ovunque** | tutti (88×) | posizionamento/proiezione dei punti |
| **rgba layering** | Background/Shower/Walls | bordi/edge con `rgba(...)` a bassa opacità |

> Idea slide: per ogni "figata" mostrare lo snippet + l'effetto sul vetro dal vivo (web component +
> CSS override per isolare il singolo trait). Highlight: **Relative Colors** e **CSS vars reattive**.

### C. Pulizia/ottimizzazione
- [ ] Comprimere le GIF (`gifsicle -O3 --lossy=80`).
- [ ] Eventuale screenshot dump pre-2025 (zanzariere) per la slide "pre-storia".

---

## ✅ Slide bonus "E ora si testa" — `shower-50-test.html` FATTO (2026-06-08)

Inserita nel chain bonus: `shower-48-capture` → **`shower-50-test`** → `last-99-qr`. Paga il seme di
`shower-38-limiti` ("un `calc()` non lo testi: la matematica va estratta in JS"). Concetto: **piramide dei test**,
zero demo live (sono test, non render).

**Fatti verificati** nel repo `configurator` (worktree principale, `components/src/ShowerPreviewer/`,
verificato 2026-06-08 — i conteggi possono driftare, riverificare prima del talk):

| Livello | Cosa | File | Numeri |
|---------|------|------|--------|
| **Unit (funzioni pure)** | `calculatePoint`, `pickVisibleSide`, `normalizeDoorsWidth` — proiezione/geometria/normalizzazione, **zero dipendenze Vue**. Vitest. | `useShowerPreviewMath.test.ts` | 18 test (12 slope geometry + 6 option normalization). Worktree `v4-modern`: 15. |
| **Snapshot (SVG)** | `toMatchFileSnapshot()` sull'`svg.element.outerHTML` serializzato. `@vue/test-utils` + `happy-dom`, `ResizeObserver` stubbato → `containerWidth=800` deterministico. | `ShowerPreviewerComponent.test.ts` + `__snapshots__/*.svg` | 9 snapshot config (sloped/visible/reverted/hidden-right/single-door/art, mirrored-glass-mask, red-glass-knob, custom). Worktree `v4-modern`: 8 (manca `*-reverted`). |
| **e2e** | Playwright, smoke "Default configuration snapshot" su `/configurator-app/previewer?freezeCamera=1`, browser vero, traversa lo Shadow DOM per `#shower-preview-svg`. Esiste **apposta** per coprire lo scaling **live** del clip-path col `containerWidth` reale (cosa che lo unit pinna via). | `e2e/tests/shower-previewer-snapshots.spec.ts` | 1 test. |

**Angolo chiave**: lo snapshot è quasi gratis perché il render è **SVG serializzabile** — lo stesso fatto che
abilita export web component e cattura JPEG (vedi `shower-48-capture`). L'e2e è **stretto di proposito**: la
coverage completa vive negli snapshot unit. Tutti i livelli provano la *rappresentazione* senza toccare i *dati*.
