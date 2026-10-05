# Strangers’ Showers — scaletta

> **Il titolo:** *Strangers’ Showers*, le docce degli estranei: quelle dei clienti, che non vedi mai.
> Il richiamo a *Stranger Things* resta nel suono e nel logo.

> *Come si testa una cosa che si vede.*
> Derivato da "Farsi una doccia col CSS" (branch `css-shower`). Stesso protagonista
> (lo Shower Previewer del configurator), domanda diversa: **come lo testi?**
> Tutti i numeri, commit e snippet sono verificati nel repo `configurator`.

## 🎯 Tesi

Il CSS non lo testi, la geometria sì. Quando il disegno smette di essere `calc()` e
diventa **dati** (SVG calcolato da funzioni pure), diventa testabile. Ma c'è un mondo
che solo un browser vero vede: il **Sottosopra**.

Tre livelli, ognuno prova la *rappresentazione* senza toccare i *dati*:

| Livello | Dove | Quanti | Cosa vede |
|---|---|---|---|
| Unit | `useShowerPreviewMath.test.ts` | 37 test (~20 ms) | punti, misure, normalizzazioni |
| Kitchen sink | `ShowerPreviewerComponent.test.ts` | 14 docce congelate + 33 test mirati sull'SVG (~0,8 s) | l'SVG intero, configurazione per configurazione |
| E2E | `e2e/tests/shower-previewer-snapshots.spec.ts` | 2 test | layout reale, paint order, pixel |

Durata: ~30-35 min. File slide: `src/slides/st-*.html` (nuove) + intro/shower riusate.

---

## Capitolo Uno — La linea gialla scomparsa (cold open, ~3 min)

Si parte da un bug **che oggi è coperto da un test**, prima del whoami.

- `st-00-cold-open` — card capitolo: il cliente mette il focus su «larghezza»… e la linea gialla non c'è.
- `st-02-linea-gialla` — la snapshot vera `single-side-profile-blocks.svg` (nicchia, un lato, senza piatto)
  con un tratteggio rosso dove dovrebbe essere la linea. Non è uno screenshot del bug: indica solo dove guardare.
  "C'è, è disegnata, è nel DOM… ma sta sotto le ombre del pavimento."
- Domanda che apre il talk: **come si testa una cosa che si vede?**
  La risposta arriva nel Capitolo Quattro (cerotto del 9 set → paint order del 10 set → e2e che conta i pixel gialli).

## Recap — Nelle puntate precedenti (~8 min)

Intro personale invariata: `intro-10-whoami` → `intro-15-storia` → `intro-20-freelance`
→ `intro-30-plan` → `intro-40-first-project` → `intro-42-shower-render` →
`intro-44-demo-bodengleich` → `intro-46-masse` → `intro-50-threejs` → `intro-55-threejs-demo`
→ `intro-60-performance` → `intro-70-wink`.

Poi l'evoluzione compressa in un "previously on…":

- `st-05-previously` — le 4 ere su una riga: skew → transform → SVG → modern.
- `shower-10-v1-skew` — il trucco (GIF).
- `shower-30-svg` — v3, punti calcolati in JS (WC live).
- `shower-40-modern` — v4 (WC live).
- `shower-42-points` — **tutti i punti, dal vivo**: "questi punti sono quello che testiamo".
- `shower-50-test` — ponte: la matematica è uscita dal CSS.

Tagliate (restano nel branch `css-shower`): web component, glass, gradient, dithering,
css-vars, color, limiti, skew-di-nuovo, blur, oklch, mask, capture.

## Capitolo Due — Il laboratorio (unit, ~5 min)

- `st-10-laboratorio` — card capitolo.
- `st-12-factory` — **una sola prop** (`inputs`) ⇒ una sola factory: `makeBaseInputs(overrides)`.
  Il disaccoppiamento dati/rappresentazione del talk CSS qui torna utile per i test.
- `st-14-unit` — esempi reali: `maxHeight` rettangolare vs inclinata, `topBreak`,
  valle invertita (fix del 9 giu 2026, seconda parte: "rest sloped panels on the tray").
  **37 test, zero righe di Vue montate.** Si testano punti e misure, non pixel.

## Capitolo Tre — Il muro di lucine (kitchen sink, ~8 min)

Il muro di Joyce: guardi tutto insieme e vedi quale lampadina lampeggia.

- `st-20-lucine` — card capitolo.
- `st-22-kitchen-sink` — **le 14 docce**, caricate direttamente dai `.svg` delle snapshot
  (`public/strangers/kitchen-sink/`, copiati da `components/src/ShowerPreviewer/__snapshots__/`).
- `st-24-harness` — come si congela una doccia in happy-dom: niente layout → stub di
  `ResizeObserver`, `clientWidth` fissato a **800**, camera ferma, immagini come `data:` URL,
  `toMatchFileSnapshot`.
- `st-26-migrazione` — la storia:
  1. ago 2025: nascono come e2e Playwright;
  2. **11 mag 2026** "updates snapshots" — *Friends don't lie… ma le snapshot sì, se le aggiorni a occhi chiusi*;
  3. **11 mag 2026** (stesso giorno) la CI fallisce: hash `data-v-*` diversi tra dev e prod → normalizzazione;
  4. **3 giu 2026** migrazione a Vitest. Nota onesta: **baseline nuove**, non copie
     (happy-dom non ha layout). Stessa cosa per il DXF, lì byte-identical.
  5. Bonus: 9 giu 2026, il fix rigenera le snapshot "picking up the slope-gradient change from the previous
     commit, which had not been re-rendered" → snapshot in ritardo sul codice.
- `st-28-diff` — **10 set 2026**: 2-4 righe cambiate in tutte e 14 le snapshot. Il diff diventa
  lo strumento di code review: vedi esattamente *cosa* è cambiato nel disegno.

## Capitolo Quattro — Il Sottosopra (e2e, ~6 min)

- `st-30-sottosopra` — card capitolo.
- `st-32-cosa-vede` — cosa happy-dom non vede: **layout** (clip-path scalato sul container
  vero), **paint order**, **pixel**. Un e2e solo, stretto di proposito. `?freezeCamera=1`:
  progettare il componente pensando a come testarlo.
- `st-34-nicchia` — **9 → 10 set 2026**: nella doccia a nicchia il segnalatore giallo
  della larghezza spariva sotto le ombre del pavimento.
  - 9 set: sposto le coordinate ("lift clear of floor fading") → workaround.
  - 10 set: il fix vero è il **paint order** SVG (estratto `MeasurementHighlights.vue`, disegnato per ultimo).
- `st-36-pixel` — il test: screenshot del container, conta le colonne di pixel gialli,
  pretende > 90% della linea. *"SVG paint order, rather than a coordinate offset"*.

## Capitolo Cinque — Il Demogorgone (l'eccezione) (~3 min)

- `st-38-demogorgone` — card capitolo "Il Demogorgone": l'eccezione. E quando il bug non è nel codice, ma nel browser del cliente?
- `st-39-chrome118` — **la doccia nera** (9 giu 2026): il feature detection `oklch(from red l c h)` dà un
  falso positivo su Chrome vecchio → `stop-color` torna al valore iniziale: **nero**. Fix: detection RGB.
  Visual: ricostruzione (snapshot `two-sides-sloped-art.svg` con gli stop riscritti in JS, non uno screenshot).
- Nessuno dei tre livelli poteva vederlo: girano tutti su un browser moderno. Il test è **ad hoc**:
  `chrome118.ts` apre Chrome 118 (Puppeteer 21.4.0) e ci guardi tu. Si usa quando il cliente si lamenta,
  non a ogni push.
- `st-40-piramide` — la piramide, con in cima "test ad hoc: Chrome 118 + un umano".

## Finale (~2 min)

- `last-100-takeaway`:
  1. **Trasforma il disegno in dati** e lo puoi testare.
  2. **Kitchen sink**: tutte le docce su un muro solo; le snapshot sono lucine.
  3. **E2E stretto**: solo quello che sa vedere soltanto il browser.
  4. **Never go full banana 🍌**: né tutto e2e, né fede cieca nelle snapshot.
- `last-99-qr` — grazie. ⚠️ Il QR "Slides" punta ancora al deck `css-shower`: da rigenerare
  quando si decide l'URL di questo.

## TODO aperti

- QR del deck da rigenerare.
- Tono Stranger Things: card capitolo in rosso, stile titoli della serie (font di sistema serif,
  niente font proprietari).
- Valutare se mostrare il diff reale del 10 set 2026 come immagine invece che come codice.
