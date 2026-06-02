# design-loop

Interactive, sanitized demos exploring **where computational models actually change drug-design decisions — and where they don't.**

Each demo runs a real model's predictions against experimental data from a live medicinal-chemistry program, then builds visualizations that test — honestly — how much the model's *accuracy* translates into *useful decisions*. Compounds appear with opaque IDs only; no structures, assay names, or chemical matter are published.

---

## 1 · SAR Matrix — a potency model, audited
*Matched-pair / R-group analysis of an internal IC50 model vs. experiment.*

The model is **excellent at absolute potency** (r ≈ 0.91) — but design is about *differences*, and there the story turns. A swap's error is mostly noise that cancels on averaging; the only real signal is a small, reproducible per-fragment bias — and it's recalibratable. The catch: **you can't shortcut the matched pairs.** "This fragment looks bad in the absolute plot" predicts the swap bias at **r ≈ 0** — you have to deconfound the context (r ≈ 0.6) or compare matched pairs directly. The **Reality-check** view shows this; a **value-of-information** panel turns it forward into *what to make next* — recalibrate the known biases for free, measure only the unresolved ones.

## 2 · SAR Brain — a free-energy model, as a decision policy
*Project timeline + policy simulator for an internal RBFE (relative binding free-energy) model.*

The model is accurate *within* a conformation but a **coin-flip on the conformational-switch edges that unlock the best chemistry** — the program's top compounds are favorable molecules sitting one false-negative crossing past the model's rejection boundary. Run a **model-trusted** policy (make everything it scores favorable, respecting that you can't score a compound without its reference) and watch it cap out; add **expert overrides** (wave through the few crucial compounds the model would skip) or an **explore budget**, and read the recovery off a live dial. The **strategy-efficiency** panel is the punchline: RBFE **enriches the potent bulk** (pIC50 ≥ 8) but adds little over blind exploration for the **best-in-class** (≥ 9) — because the best compounds are exactly the ones it said *skip*.

---

**The thread:** an accurate model is not automatically a useful one. These tools are how I tell the difference — benchmark against experiment, separate model limits from data noise, and find where human judgment still earns its keep.

## Running
Static HTML (Plotly + inline SVG, no build step). Open via GitHub Pages, or locally run `python -m http.server` inside an app folder and open `index.html`.

## Sanitization
Committed files contain only opaque compound IDs and numeric values. Structures, real IDs, assay/vendor names, and the build scripts are git-ignored and never published; the viewers degrade gracefully when the private data is absent.
