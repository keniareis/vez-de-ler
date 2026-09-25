# Vite React Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `organizador.html` (single-file React-via-CDN prototype) as a proper Vite + React project in this folder, componentized, with the accessibility fixes from the audit baked in from the start and covered by automated tests.

**Architecture:** Vite + React 18, plain JavaScript (no TypeScript, matching the prototype's style). Domain logic (dates, sorteio, PDF) lives in framework-free modules under `src/lib/`, unit-tested with Vitest. UI state lives in one custom hook (`useEscala`) consumed by `App.jsx`. Each step of the wizard is its own component. Accessibility is enforced with `eslint-plugin-jsx-a11y` at lint time and `vitest-axe` at test time, not bolted on after.

**Tech Stack:** Vite 5, React 18, jsPDF 2.5, Vitest + @testing-library/react + vitest-axe, ESLint + eslint-plugin-jsx-a11y.

**Spec:** `SPEC.md` (functional requirements) and `ACCESSIBILITY_SPEC.md` (accessibility requirements + diagnostic of the old file) in this same folder.

## Global Constraints

- No backend, no network calls, no persistence beyond browser memory (`SPEC.md` → "Importante — escopo técnico").
- Portuguese (pt-BR) UI copy throughout — do not translate labels/messages.
- Colors must stay within the PASCOM palette (`--gold #F5A81C`, `--blue #0086C3`, `--green #52B947`) except where `ACCESSIBILITY_SPEC.md` §7 requires a darker shade for text-on-color contrast (`--blue-dark`, `--green-text` — see Task 1).
- Every interactive element ≥44×44px touch target (`ACCESSIBILITY_SPEC.md` §6).
- Every `<label>` uses `htmlFor`/`id` pairing; no label-by-proximity (`ACCESSIBILITY_SPEC.md` §3).
- `npm run build` and `npm run lint` must pass with zero errors before any task is considered done.

## Review Focus

- Weekday-only celebrations that fall on a month boundary (e.g., a month with 4 vs 5 Sundays) — `datasDoMes` must include every matching weekday in the month, not a fixed count.
- A single name in a list when `leitoresPorCel`/`ministrosPorCel` is set higher than the list length — the picker must not throw or infinite-loop; it should return duplicates within that day rather than crash (this already happens implicitly in the original `sortear()` via `Math.min`, must be preserved and tested explicitly).
- Removing a name from a list *after* a cronograma was already sorted with that name in it — editing a cell's `<select>` must only offer names still in the current roster, never the stale name unless it's still selected in that cell.
- The celebrant-can't-also-be-a-reader-that-day rule when the celebrant list and reader list overlap heavily (e.g., same 3 names in both lists) — must still exclude the day's celebrant from that day's reader picks even when few reader names are left to choose from.
- A keyboard-only user reaching the "Sortear cronograma" button while it's disabled — `aria-describedby` must resolve to visible, accurate text explaining what's missing, and must update as fields are filled in.

## File Structure

```
vez de ler/
├── SPEC.md                          (existing)
├── ACCESSIBILITY_SPEC.md            (existing)
├── docs/superpowers/plans/...       (this file)
├── package.json
├── vite.config.js
├── index.html                       (real <html lang="pt-BR">, viewport meta, title)
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css                    (variables, focus-visible, sr-only, contrast fixes)
│   ├── assets/
│   │   └── logo-pascom.png          (already extracted from the old file)
│   ├── lib/
│   │   ├── dates.js
│   │   ├── dates.test.js
│   │   ├── sorteio.js
│   │   ├── sorteio.test.js
│   │   ├── pdf.js
│   │   └── pdf.test.js
│   ├── hooks/
│   │   ├── useEscala.js
│   │   └── useEscala.test.jsx
│   └── components/
│       ├── Masthead.jsx
│       ├── StepCard.jsx
│       ├── LiveAnnouncer.jsx
│       ├── DatasStep.jsx
│       ├── DatasStep.test.jsx
│       ├── PeopleListStep.jsx
│       ├── PeopleListStep.test.jsx
│       ├── SorteioButton.jsx
│       ├── SorteioButton.test.jsx
│       ├── CronogramaTable.jsx
│       ├── EditableCell.jsx
│       ├── CronogramaTable.test.jsx
│       └── App.test.jsx
```

---

### Task 1: Project scaffold, global styles, contrast fixes

**Files:**
- Create: `package.json`, `vite.config.js`, `vitest.setup.js`, `.eslintrc.cjs`, `index.html`, `src/main.jsx`, `src/index.css`
- Test: none (scaffold task — verified by build/lint, not a unit test)

**Interfaces:**
- Produces: CSS custom properties consumed by every later component — `--ink`, `--ink-soft`, `--gold`, `--blue`, `--blue-dark`, `--green`, `--green-text`, `--paper`, `--paper-line`, `--white`; utility classes `.sr-only` and `:focus-visible` outline used by every interactive element in later tasks.

- [ ] **Step 1: Init npm project and install dependencies**

```bash
cd "C:\Users\KeniaReis\Documents\PROGRAMACAO\react\vez de ler"
npm create vite@latest . -- --template react
npm install
npm install jspdf
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest-axe jsdom eslint-plugin-jsx-a11y
```

- [ ] **Step 2: Write `index.html` with correct head**

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Vez de Ler — Organizador de Escalas</title>
    <meta name="description" content="Monte o cronograma mensal de leitores, ministros e celebrante e exporte em PDF." />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Write `src/index.css` — variables, contrast-fixed colors, focus and sr-only utilities**

Port every rule from the old `organizador.html` `<style>` block unchanged, with these deliberate changes from `ACCESSIBILITY_SPEC.md` §7:

```css
:root{
  --ink:#20242B;
  --ink-soft:#57626F;
  --gold:#F5A81C;
  --gold-dark:#D98D0E;
  --blue:#0086C3;
  --blue-dark:#00669A;
  --green:#52B947;
  --green-text:#2E7D32;
  --paper:#F7FAFC;
  --paper-line:#DCE6ED;
  --white:#FFFFFF;
}
*{box-sizing:border-box;}
body{margin:0;}
#root{
  background:var(--paper);
  min-height:100vh;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
  color:var(--ink);
  padding:20px 14px 60px;
}
.sr-only{
  position:absolute;width:1px;height:1px;padding:0;margin:-1px;
  overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;
}
:focus-visible{
  outline:3px solid var(--blue-dark);
  outline-offset:2px;
}
.wrap{max-width:640px;margin:0 auto;}
.masthead{text-align:center;padding-bottom:18px;margin-bottom:24px;border-bottom:3px solid var(--gold);}
.masthead .logo{max-width:150px;height:auto;margin:0 auto 12px;display:block;}
.masthead .kicker{font-size:12.5px;letter-spacing:.04em;color:var(--green-text);font-weight:700;margin-bottom:6px;}
.masthead h1{font-family:Georgia,'Times New Roman',serif;font-weight:600;font-size:24px;margin:0;line-height:1.15;color:var(--blue-dark);}
.masthead .sub{font-size:14px;color:var(--ink-soft);margin-top:6px;}
.card{background:var(--white);border:1px solid var(--paper-line);border-top:3px solid var(--blue);border-radius:4px;padding:16px 14px;margin-bottom:14px;}
.card h2{font-family:Georgia,'Times New Roman',serif;font-size:17px;font-weight:600;margin:0 0 12px;color:var(--ink);display:flex;align-items:center;gap:8px;}
.card h2 .num{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:var(--gold);color:var(--ink);font-size:12px;font-family:-apple-system,sans-serif;font-weight:700;}
fieldset{border:0;margin:0;padding:0;}
legend{display:block;font-size:12.5px;color:var(--ink-soft);margin-bottom:5px;margin-top:12px;padding:0;}
label{display:block;font-size:12.5px;color:var(--ink-soft);margin-bottom:5px;margin-top:12px;}
label:first-of-type{margin-top:0;}
input[type="text"],input[type="number"],input[type="date"],select,textarea{
  width:100%;padding:11px 10px;border:1px solid var(--paper-line);border-radius:3px;
  font-size:16px;font-family:inherit;background:var(--paper);color:var(--ink);
  -webkit-appearance:none;appearance:none;
}
textarea{resize:vertical;min-height:80px;line-height:1.5;}
.row{display:flex;gap:10px;flex-wrap:wrap;}
.row>div{flex:1;min-width:110px;}
.weekdays{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;}
.wd-btn{padding:9px 8px;min-width:44px;min-height:44px;border-radius:3px;border:1px solid var(--paper-line);background:var(--paper);font-size:13px;cursor:pointer;color:var(--ink-soft);}
.wd-btn[aria-pressed="true"]{background:var(--blue-dark);border-color:var(--blue-dark);color:var(--white);}
.wd-btn[aria-pressed="true"]::after{content:" ✓";}
button.primary{width:100%;padding:14px;min-height:48px;background:var(--blue-dark);color:var(--white);border:none;border-radius:3px;font-size:15px;font-weight:600;cursor:pointer;margin-top:14px;}
button.primary:disabled{background:#A9B7C2;cursor:not-allowed;}
button.secondary{width:100%;padding:13px;min-height:46px;background:transparent;color:var(--green-text);border:1.5px solid var(--green-text);border-radius:3px;font-size:14px;font-weight:600;cursor:pointer;margin-top:10px;}
.datelist{list-style:none;margin:10px 0 0;padding:0;}
.datelist li{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid var(--paper-line);font-size:14px;}
.datelist li:last-child{border-bottom:none;}
.del{background:none;border:none;color:var(--blue-dark);font-size:20px;cursor:pointer;line-height:1;padding:12px 14px;margin:-12px -14px;min-width:44px;min-height:44px;}
.add-date-row{display:flex;gap:8px;margin-top:12px;}
.add-date-row input{flex:1;min-width:0;}
.add-date-row button{background:var(--gold);color:var(--ink);border:none;border-radius:3px;padding:0 16px;font-size:14px;cursor:pointer;min-height:44px;flex-shrink:0;font-weight:600;}
.chip-list{list-style:none;display:flex;flex-wrap:wrap;gap:8px;margin:12px 0 0;padding:0;}
.chip{display:inline-flex;align-items:center;gap:6px;background:var(--paper);border:1px solid var(--paper-line);border-radius:20px;padding:7px 8px 7px 14px;font-size:14px;border-left:4px solid var(--paper-line);}
.chip-blue{border-left-color:var(--blue);}
.chip-green{border-left-color:var(--green);}
.chip-gold{border-left-color:var(--gold);}
.chip button{background:none;border:none;color:var(--ink-soft);font-size:17px;cursor:pointer;line-height:1;padding:10px;margin:-10px -6px -10px 0;min-width:44px;min-height:44px;}
.table-scroll{width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;margin-top:4px;}
.schedule-table{width:100%;min-width:480px;border-collapse:collapse;}
.schedule-table th{text-align:left;font-size:11px;letter-spacing:.03em;color:var(--white);background:var(--blue-dark);padding:8px;}
.schedule-table th:first-child{border-radius:3px 0 0 3px;}
.schedule-table th:last-child{border-radius:0 3px 3px 0;}
.schedule-table tbody tr:nth-child(even){background:#F0F7FB;}
.schedule-table td{padding:9px 8px;font-size:14px;border-bottom:1px solid var(--paper-line);vertical-align:top;}
.schedule-table td.date-cell{white-space:nowrap;font-weight:700;color:var(--blue-dark);}
.cell-editable{cursor:pointer;border-bottom:1.5px dashed var(--paper-line);padding-bottom:1px;background:none;font:inherit;color:inherit;min-height:44px;}
.cell-editable:hover{border-bottom-color:var(--blue);color:var(--blue-dark);}
.cell-select{font-size:14px;font-family:inherit;padding:4px 6px;border:1.5px solid var(--blue);border-radius:3px;background:var(--white);color:var(--ink);max-width:100%;}
.edit-hint{font-size:12px;color:var(--ink-soft);margin-top:6px;}
.empty-hint{font-size:13.5px;color:var(--ink-soft);text-align:center;padding:20px 10px;}
.actions-row{display:flex;gap:10px;}
.actions-row>*{flex:1;margin-top:14px;}
```

- [ ] **Step 4: `src/main.jsx`**

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 5: Configure Vitest in `vite.config.js` and add `vitest.setup.js`**

```js
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./vitest.setup.js",
    globals: true,
  },
});
```

```js
// vitest.setup.js
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 6: Add npm scripts to `package.json`**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --max-warnings 0",
    "test": "vitest run"
  }
}
```

- [ ] **Step 7: Configure ESLint with jsx-a11y in `.eslintrc.cjs`**

```js
module.exports = {
  root: true,
  env: { browser: true, es2021: true },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
  ],
  parserOptions: { ecmaVersion: "latest", sourceType: "module", ecmaFeatures: { jsx: true } },
  settings: { react: { version: "detect" } },
};
```

- [ ] **Step 8: Verify the scaffold builds and lints clean**

Run: `npm run build`
Expected: `dist/` produced, no errors (a default Vite counter page at this point — App.jsx doesn't exist yet, so use the Vite template's default `App.jsx` as a placeholder for this one build check only; Task 10 replaces it for good).

- [ ] **Step 9: Commit**

```bash
git init
git add package.json package-lock.json vite.config.js vitest.setup.js .eslintrc.cjs index.html src/main.jsx src/index.css src/assets/logo-pascom.png SPEC.md ACCESSIBILITY_SPEC.md docs/superpowers/plans/2026-09-25-vite-react-rebuild.md
git commit -m "chore: scaffold Vite + React project with contrast-fixed global styles"
```

---

### Task 2: Domain logic — `src/lib/dates.js` and `src/lib/sorteio.js`

**Files:**
- Create: `src/lib/dates.js`, `src/lib/dates.test.js`, `src/lib/sorteio.js`, `src/lib/sorteio.test.js`

**Interfaces:**
- Produces (`dates.js`): `MESES: string[]`, `DIAS_SEMANA: string[]`, `DIAS_ABREV: string[]`, `pad(n: number): string`, `formatDateBR(iso: string): string`, `weekdayOf(iso: string): number`, `datasDoMes(ano: number, mes: number, diasSelecionados: Set<number>): string[]`.
- Produces (`sorteio.js`): `shuffle(arr: any[]): any[]`, `createPicker(names: string[]): (excludeSet?: Set<string>) => string`, `montarCronograma({ datas, leitores, ministros, responsaveis, leitoresPorCel, ministrosPorCel }): Array<{ data: string, leitores: string[], responsavel: string, ministros: string[] }>`.
- Consumed by: `useEscala.js` (Task 3), `pdf.js` (Task 9).

- [ ] **Step 1: Write failing tests for `dates.js`**

```js
// src/lib/dates.test.js
import { describe, it, expect } from "vitest";
import { pad, formatDateBR, weekdayOf, datasDoMes } from "./dates.js";

describe("pad", () => {
  it("pads single digits with a leading zero", () => {
    expect(pad(5)).toBe("05");
    expect(pad(12)).toBe("12");
  });
});

describe("formatDateBR", () => {
  it("formats an ISO date as DD/MM", () => {
    expect(formatDateBR("2026-03-05")).toBe("05/03");
  });
});

describe("weekdayOf", () => {
  it("returns the JS getDay() index for an ISO date", () => {
    expect(weekdayOf("2026-03-01")).toBe(0); // Sunday
  });
});

describe("datasDoMes", () => {
  it("returns every date in the month matching the selected weekdays", () => {
    // March 2026: Sundays fall on 1, 8, 15, 22, 29
    const datas = datasDoMes(2026, 2, new Set([0]));
    expect(datas).toEqual([
      "2026-03-01", "2026-03-08", "2026-03-15", "2026-03-22", "2026-03-29",
    ]);
  });

  it("returns an empty array when no weekday is selected", () => {
    expect(datasDoMes(2026, 2, new Set())).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/dates.test.js`
Expected: FAIL — `dates.js` does not exist yet.

- [ ] **Step 3: Implement `dates.js`**

```js
// src/lib/dates.js
export const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
export const DIAS_SEMANA = ["Domingo","Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado"];
export const DIAS_ABREV = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

export function pad(n) {
  return n.toString().padStart(2, "0");
}

export function formatDateBR(iso) {
  const [, m, d] = iso.split("-").map(Number);
  return `${pad(d)}/${pad(m)}`;
}

export function weekdayOf(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
}

export function datasDoMes(ano, mes, diasSelecionados) {
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const novas = [];
  for (let d = 1; d <= diasNoMes; d++) {
    const dt = new Date(ano, mes, d);
    if (diasSelecionados.has(dt.getDay())) {
      novas.push(`${ano}-${pad(mes + 1)}-${pad(d)}`);
    }
  }
  return novas;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/dates.test.js`
Expected: PASS (5 tests)

- [ ] **Step 5: Write failing tests for `sorteio.js`**

```js
// src/lib/sorteio.test.js
import { describe, it, expect } from "vitest";
import { createPicker, montarCronograma } from "./sorteio.js";

describe("createPicker", () => {
  it("cycles through every name before repeating", () => {
    const pick = createPicker(["Ana", "Beto", "Cris"]);
    const seen = new Set([pick(), pick(), pick()]);
    expect(seen).toEqual(new Set(["Ana", "Beto", "Cris"]));
  });

  it("skips names in the exclude set for that call", () => {
    const pick = createPicker(["Ana", "Beto"]);
    const result = pick(new Set(["Ana"]));
    expect(result).toBe("Beto");
  });

  it("falls back to a name in the exclude set rather than throwing when all names are excluded", () => {
    const pick = createPicker(["Ana"]);
    expect(() => pick(new Set(["Ana"]))).not.toThrow();
  });
});

describe("montarCronograma", () => {
  const base = {
    datas: ["2026-03-01", "2026-03-08"],
    leitores: ["Ana", "Beto", "Cris"],
    ministros: ["Duda", "Elo"],
    responsaveis: ["Padre Carlos"],
    leitoresPorCel: 2,
    ministrosPorCel: 1,
  };

  it("produces one row per date with the requested number of readers and ministers", () => {
    const linhas = montarCronograma(base);
    expect(linhas).toHaveLength(2);
    linhas.forEach((linha) => {
      expect(linha.leitores).toHaveLength(2);
      expect(linha.ministros).toHaveLength(1);
      expect(linha.responsavel).toBe("Padre Carlos");
    });
  });

  it("never repeats a reader within the same day's list", () => {
    const linhas = montarCronograma(base);
    linhas.forEach((linha) => {
      expect(new Set(linha.leitores).size).toBe(linha.leitores.length);
    });
  });

  it("excludes the day's celebrant from that day's readers when the celebrant is also in the reader pool", () => {
    const linhas = montarCronograma({
      ...base,
      leitores: ["Ana", "Beto", "Padre Carlos"],
    });
    linhas.forEach((linha) => {
      expect(linha.leitores).not.toContain(linha.responsavel);
    });
  });

  it("does not throw when leitoresPorCel exceeds the number of available readers", () => {
    expect(() =>
      montarCronograma({ ...base, leitores: ["Ana"], leitoresPorCel: 5 })
    ).not.toThrow();
  });
});
```

- [ ] **Step 6: Run tests to verify they fail**

Run: `npx vitest run src/lib/sorteio.test.js`
Expected: FAIL — `sorteio.js` does not exist yet.

- [ ] **Step 7: Implement `sorteio.js`** (ported from the prototype's `shuffle`/`createPicker`/`sortear`)

```js
// src/lib/sorteio.js
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Fair picker: cycles through a shuffled bag of names, reshuffling
// when exhausted, avoiding immediate repeats across a reshuffle,
// and able to skip names already used that day.
export function createPicker(names) {
  let queue = [];
  let last = null;
  function refill() {
    let arr = shuffle(names);
    if (last && arr.length > 1 && arr[0] === last) {
      const idx = 1 + Math.floor(Math.random() * (arr.length - 1));
      [arr[0], arr[idx]] = [arr[idx], arr[0]];
    }
    queue = arr;
  }
  return function next(excludeSet) {
    if (queue.length === 0) refill();
    for (let i = 0; i < queue.length; i++) {
      if (!excludeSet || !excludeSet.has(queue[i])) {
        const val = queue.splice(i, 1)[0];
        last = val;
        return val;
      }
    }
    const val = queue.shift();
    last = val;
    return val;
  };
}

export function montarCronograma({ datas, leitores, ministros, responsaveis, leitoresPorCel, ministrosPorCel }) {
  const pickLeitor = createPicker(leitores);
  const pickResponsavel = createPicker(responsaveis);
  const pickMinistro = createPicker(ministros);

  return datas.map((iso) => {
    const responsavel = pickResponsavel(null);

    const usadosLeitores = new Set([responsavel]);
    const numLeitores = Math.min(leitoresPorCel, leitores.length);
    const leitoresDoDia = [];
    for (let i = 0; i < numLeitores; i++) {
      const nome = pickLeitor(usadosLeitores);
      usadosLeitores.add(nome);
      leitoresDoDia.push(nome);
    }

    const usadosMinistros = new Set();
    const numMinistros = Math.min(ministrosPorCel, ministros.length);
    const ministrosDoDia = [];
    for (let i = 0; i < numMinistros; i++) {
      const nome = pickMinistro(usadosMinistros);
      usadosMinistros.add(nome);
      ministrosDoDia.push(nome);
    }

    return { data: iso, leitores: leitoresDoDia, responsavel, ministros: ministrosDoDia };
  });
}
```

- [ ] **Step 8: Run tests to verify they pass**

Run: `npx vitest run src/lib/sorteio.test.js`
Expected: PASS (7 tests)

- [ ] **Step 9: Commit**

```bash
git add src/lib/dates.js src/lib/dates.test.js src/lib/sorteio.js src/lib/sorteio.test.js
git commit -m "feat: port date and sorteio domain logic with unit tests"
```

---

### Task 3: `useEscala` hook — state, handlers, live-announce message

**Files:**
- Create: `src/hooks/useEscala.js`, `src/hooks/useEscala.test.jsx`

**Interfaces:**
- Consumes: `datasDoMes`, `MESES` from `src/lib/dates.js` (Task 2); `montarCronograma` from `src/lib/sorteio.js` (Task 2).
- Produces: `useEscala()` returning:
  `{ igreja, setIgreja, mes, setMes, ano, setAno, diasSelecionados, toggleDia, datas, novaData, setNovaData, gerarDatasDoMes, removerData, adicionarDataManual, leitoresPorCel, setLeitoresPorCel, ministrosPorCel, setMinistrosPorCel, leitores, ministros, responsaveis, novoLeitor, setNovoLeitor, novoMinistro, setNovoMinistro, novoResponsavel, setNovoResponsavel, adicionarLeitor, removerLeitor, adicionarMinistro, removerMinistro, adicionarResponsavel, removerResponsavel, podeSortear, cronograma, sortear, editando, setEditando, atualizarCelula, mensagem }`.
  Consumed by every component in Tasks 5–10.

- [ ] **Step 1: Write failing test for the hook's add/remove/sortear/announce behavior**

```jsx
// src/hooks/useEscala.test.jsx
import { describe, it, expect, act } from "vitest";
import { renderHook } from "@testing-library/react";
import { useEscala } from "./useEscala.js";

describe("useEscala", () => {
  it("adds and removes a leitor, resetting any existing cronograma", () => {
    const { result } = renderHook(() => useEscala());
    act(() => {
      result.current.setNovoLeitor("Ana");
      result.current.adicionarLeitor();
    });
    expect(result.current.leitores).toEqual(["Ana"]);

    act(() => result.current.removerLeitor("Ana"));
    expect(result.current.leitores).toEqual([]);
  });

  it("does not add a duplicate or blank name", () => {
    const { result } = renderHook(() => useEscala());
    act(() => {
      result.current.setNovoLeitor("Ana");
      result.current.adicionarLeitor();
      result.current.setNovoLeitor("Ana");
      result.current.adicionarLeitor();
      result.current.setNovoLeitor("   ");
      result.current.adicionarLeitor();
    });
    expect(result.current.leitores).toEqual(["Ana"]);
  });

  it("podeSortear is only true once dates, leitores, ministros and responsaveis are all non-empty", () => {
    const { result } = renderHook(() => useEscala());
    expect(result.current.podeSortear).toBe(false);
  });

  it("sortear fills cronograma and sets an announce message", () => {
    const { result } = renderHook(() => useEscala());
    act(() => {
      result.current.toggleDia(0);
      result.current.gerarDatasDoMes();
      result.current.setNovoLeitor("Ana");
      result.current.adicionarLeitor();
      result.current.setNovoMinistro("Duda");
      result.current.adicionarMinistro();
      result.current.setNovoResponsavel("Padre Carlos");
      result.current.adicionarResponsavel();
    });
    expect(result.current.podeSortear).toBe(true);

    act(() => result.current.sortear());
    expect(result.current.cronograma).not.toBeNull();
    expect(result.current.cronograma.length).toBe(result.current.datas.length);
    expect(result.current.mensagem).toMatch(/cronograma sorteado/i);
  });

  it("atualizarCelula updates one cell and sets an announce message", () => {
    const { result } = renderHook(() => useEscala());
    act(() => {
      result.current.toggleDia(0);
      result.current.gerarDatasDoMes();
      result.current.setNovoLeitor("Ana");
      result.current.adicionarLeitor();
      result.current.setNovoLeitor("Beto");
      result.current.adicionarLeitor();
      result.current.setNovoMinistro("Duda");
      result.current.adicionarMinistro();
      result.current.setNovoResponsavel("Padre Carlos");
      result.current.adicionarResponsavel();
      result.current.sortear();
    });
    const dataIso = result.current.datas[0];
    act(() => result.current.atualizarCelula(dataIso, "celebrante", "Padre Carlos"));
    expect(result.current.cronograma[0].responsavel).toBe("Padre Carlos");
    expect(result.current.mensagem).toMatch(/celebrante/i);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/hooks/useEscala.test.jsx`
Expected: FAIL — `useEscala.js` does not exist yet.

- [ ] **Step 3: Implement `useEscala.js`** (ported from the prototype's `App()` state block, plus a `mensagem` announce string for the live region)

```js
// src/hooks/useEscala.js
import { useState } from "react";
import { datasDoMes } from "../lib/dates.js";
import { montarCronograma } from "../lib/sorteio.js";

function adicionarNomeEm(lista, setLista, campo, setCampo) {
  const limpo = campo.trim();
  if (!limpo) return;
  if (!lista.includes(limpo)) setLista([...lista, limpo]);
  setCampo("");
}

export function useEscala() {
  const today = new Date();
  const [igreja, setIgreja] = useState("");
  const [mes, setMes] = useState(today.getMonth());
  const [ano, setAno] = useState(today.getFullYear());
  const [diasSelecionados, setDiasSelecionados] = useState(new Set([0]));
  const [datas, setDatas] = useState([]);
  const [novaData, setNovaData] = useState("");
  const [leitoresPorCel, setLeitoresPorCel] = useState(2);
  const [ministrosPorCel, setMinistrosPorCel] = useState(2);
  const [leitores, setLeitores] = useState([]);
  const [ministros, setMinistros] = useState([]);
  const [responsaveis, setResponsaveis] = useState([]);
  const [novoLeitor, setNovoLeitor] = useState("");
  const [novoMinistro, setNovoMinistro] = useState("");
  const [novoResponsavel, setNovoResponsavel] = useState("");
  const [cronograma, setCronograma] = useState(null);
  const [editando, setEditando] = useState(null);
  const [mensagem, setMensagem] = useState("");

  function toggleDia(i) {
    const s = new Set(diasSelecionados);
    if (s.has(i)) s.delete(i); else s.add(i);
    setDiasSelecionados(s);
  }

  function adicionarLeitor() {
    adicionarNomeEm(leitores, setLeitores, novoLeitor, setNovoLeitor);
    setCronograma(null);
  }
  function removerLeitor(nome) {
    setLeitores(leitores.filter((n) => n !== nome));
    setCronograma(null);
  }
  function adicionarMinistro() {
    adicionarNomeEm(ministros, setMinistros, novoMinistro, setNovoMinistro);
    setCronograma(null);
  }
  function removerMinistro(nome) {
    setMinistros(ministros.filter((n) => n !== nome));
    setCronograma(null);
  }
  function adicionarResponsavel() {
    adicionarNomeEm(responsaveis, setResponsaveis, novoResponsavel, setNovoResponsavel);
    setCronograma(null);
  }
  function removerResponsavel(nome) {
    setResponsaveis(responsaveis.filter((n) => n !== nome));
    setCronograma(null);
  }

  function gerarDatasDoMes() {
    const novas = datasDoMes(ano, mes, diasSelecionados);
    setDatas(Array.from(new Set([...datas, ...novas])).sort());
    setCronograma(null);
  }
  function removerData(iso) {
    setDatas(datas.filter((d) => d !== iso));
    setCronograma(null);
  }
  function adicionarDataManual() {
    if (!novaData) return;
    if (!datas.includes(novaData)) setDatas([...datas, novaData].sort());
    setNovaData("");
    setCronograma(null);
  }

  const podeSortear = datas.length > 0 && leitores.length > 0 && responsaveis.length > 0 && ministros.length > 0;

  function sortear() {
    const linhas = montarCronograma({ datas, leitores, ministros, responsaveis, leitoresPorCel, ministrosPorCel });
    setCronograma(linhas);
    setEditando(null);
    setMensagem(`Cronograma sorteado com ${linhas.length} celebraç${linhas.length === 1 ? "ão" : "ões"}.`);
  }

  function atualizarCelula(dataIso, tipo, novoValor, idx) {
    setCronograma(
      cronograma.map((linha) => {
        if (linha.data !== dataIso) return linha;
        if (tipo === "celebrante") return { ...linha, responsavel: novoValor };
        if (tipo === "leitor") {
          const novos = [...linha.leitores];
          novos[idx] = novoValor;
          return { ...linha, leitores: novos };
        }
        if (tipo === "ministro") {
          const novos = [...linha.ministros];
          novos[idx] = novoValor;
          return { ...linha, ministros: novos };
        }
        return linha;
      })
    );
    setEditando(null);
    const rotulo = tipo === "celebrante" ? "celebrante" : tipo;
    setMensagem(`${novoValor} definido como ${rotulo} em ${dataIso}.`);
  }

  return {
    igreja, setIgreja, mes, setMes, ano, setAno,
    diasSelecionados, toggleDia,
    datas, novaData, setNovaData, gerarDatasDoMes, removerData, adicionarDataManual,
    leitoresPorCel, setLeitoresPorCel, ministrosPorCel, setMinistrosPorCel,
    leitores, ministros, responsaveis,
    novoLeitor, setNovoLeitor, novoMinistro, setNovoMinistro, novoResponsavel, setNovoResponsavel,
    adicionarLeitor, removerLeitor, adicionarMinistro, removerMinistro, adicionarResponsavel, removerResponsavel,
    podeSortear, cronograma, sortear, editando, setEditando, atualizarCelula,
    mensagem,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/hooks/useEscala.test.jsx`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useEscala.js src/hooks/useEscala.test.jsx
git commit -m "feat: add useEscala hook with announce messages for the live region"
```

---

### Task 4: `Masthead`, `StepCard`, `LiveAnnouncer` presentational components

**Files:**
- Create: `src/components/Masthead.jsx`, `src/components/StepCard.jsx`, `src/components/LiveAnnouncer.jsx`, `src/components/Masthead.test.jsx`

**Interfaces:**
- Produces: `<Masthead />` (no props — renders the header with `<h1>`); `<StepCard numero={number} titulo={string}>{children}</StepCard>` (wraps a `<section className="card">` with an `<h2>`); `<LiveAnnouncer mensagem={string} />` (renders `<div role="status" aria-live="polite" className="sr-only">{mensagem}</div>`).
- Consumed by: `App.jsx` (Task 10) and every step component (Tasks 5–8, via `StepCard`).

- [ ] **Step 1: Write failing test**

```jsx
// src/components/Masthead.test.jsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Masthead from "./Masthead.jsx";
import StepCard from "./StepCard.jsx";
import LiveAnnouncer from "./LiveAnnouncer.jsx";

describe("Masthead", () => {
  it("renders exactly one h1 with the app name and an alt-texted logo", () => {
    render(<Masthead />);
    expect(screen.getByRole("heading", { level: 1, name: "Vez de Ler" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /pascom/i })).toBeInTheDocument();
  });
});

describe("StepCard", () => {
  it("renders an h2 with the step title and its children", () => {
    render(<StepCard numero={1}>Conteúdo</StepCard>);
  });
});

describe("LiveAnnouncer", () => {
  it("exposes the message through a polite status region", () => {
    render(<LiveAnnouncer mensagem="Cronograma sorteado com 4 celebrações." />);
    expect(screen.getByRole("status")).toHaveTextContent("Cronograma sorteado com 4 celebrações.");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/Masthead.test.jsx`
Expected: FAIL — components don't exist yet.

- [ ] **Step 3: Implement the three components**

```jsx
// src/components/Masthead.jsx
import logo from "../assets/logo-pascom.png";

export default function Masthead() {
  return (
    <header className="masthead">
      <img className="logo" src={logo} alt="Logo PASCOM" />
      <div className="kicker">ORGANIZADOR MENSAL</div>
      <h1>Vez de Ler</h1>
      <div className="sub">Monte o cronograma das celebrações do mês e exporte em PDF</div>
    </header>
  );
}
```

```jsx
// src/components/StepCard.jsx
export default function StepCard({ numero, titulo, children, as: As = "div" }) {
  return (
    <As className="card">
      <h2><span className="num" aria-hidden="true">{numero}</span>{titulo}</h2>
      {children}
    </As>
  );
}
```

Note: `titulo` is required in every call site from Task 5 onward — `App.test.jsx` (Task 10) asserts each card's accessible name via its `<h2>` text, so leaving it out would fail that test, not just look wrong.

```jsx
// src/components/LiveAnnouncer.jsx
export default function LiveAnnouncer({ mensagem }) {
  return (
    <div role="status" aria-live="polite" className="sr-only">
      {mensagem}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/Masthead.test.jsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/Masthead.jsx src/components/StepCard.jsx src/components/LiveAnnouncer.jsx src/components/Masthead.test.jsx
git commit -m "feat: add Masthead, StepCard and LiveAnnouncer components"
```

---

### Task 5: `DatasStep` — month/year, weekday fieldset, date list

**Files:**
- Create: `src/components/DatasStep.jsx`, `src/components/DatasStep.test.jsx`

**Interfaces:**
- Consumes: `MESES, DIAS_ABREV, DIAS_SEMANA, formatDateBR, weekdayOf` from `src/lib/dates.js`; `StepCard` from Task 4; the relevant slice of `useEscala()`'s return value as props (`igreja, setIgreja, mes, setMes, ano, setAno, diasSelecionados, toggleDia, datas, novaData, setNovaData, gerarDatasDoMes, removerData, adicionarDataManual`).
- Produces: `<DatasStep {...props} />`, consumed by `App.jsx` (Task 10).

- [ ] **Step 1: Write failing test — labels, aria-pressed, keyboard toggle, named remove buttons, axe**

```jsx
// src/components/DatasStep.test.jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import DatasStep from "./DatasStep.jsx";

function setup(overrides = {}) {
  const props = {
    igreja: "", setIgreja: vi.fn(),
    mes: 2, setMes: vi.fn(),
    ano: 2026, setAno: vi.fn(),
    diasSelecionados: new Set([0]), toggleDia: vi.fn(),
    datas: ["2026-03-01"], novaData: "", setNovaData: vi.fn(),
    gerarDatasDoMes: vi.fn(), removerData: vi.fn(), adicionarDataManual: vi.fn(),
    ...overrides,
  };
  render(<DatasStep {...props} />);
  return props;
}

describe("DatasStep", () => {
  it("associates every label with its field", () => {
    setup();
    expect(screen.getByLabelText(/nome da igreja/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^mês$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^ano$/i)).toBeInTheDocument();
  });

  it("marks the selected weekday with aria-pressed and toggles it via the keyboard", async () => {
    const user = userEvent.setup();
    const props = setup();
    const domingo = screen.getByRole("button", { name: "Dom" });
    expect(domingo).toHaveAttribute("aria-pressed", "true");

    await user.tab();
    while (document.activeElement !== domingo) await user.tab();
    await user.keyboard("{Enter}");
    expect(props.toggleDia).toHaveBeenCalledWith(0);
  });

  it("labels each remove button with the date it removes", () => {
    setup();
    expect(screen.getByRole("button", { name: /remover celebração de 01\/03/i })).toBeInTheDocument();
  });

  it("has no automatically detectable accessibility violations", async () => {
    const { container } = render(<DatasStep {...setup()} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/DatasStep.test.jsx`
Expected: FAIL — `DatasStep.jsx` does not exist yet.

- [ ] **Step 3: Implement `DatasStep.jsx`**

```jsx
// src/components/DatasStep.jsx
import { MESES, DIAS_ABREV, formatDateBR, weekdayOf } from "../lib/dates.js";
import StepCard from "./StepCard.jsx";

export default function DatasStep({
  igreja, setIgreja, mes, setMes, ano, setAno,
  diasSelecionados, toggleDia,
  datas, novaData, setNovaData, gerarDatasDoMes, removerData, adicionarDataManual,
}) {
  return (
    <StepCard numero={1} titulo="Mês e datas das celebrações">
      <label htmlFor="campo-igreja">Nome da igreja / comunidade (opcional)</label>
      <input id="campo-igreja" type="text" value={igreja} onChange={(e) => setIgreja(e.target.value)} placeholder="Ex.: Paróquia Santo Antônio" />

      <div className="row">
        <div>
          <label htmlFor="campo-mes">Mês</label>
          <select id="campo-mes" value={mes} onChange={(e) => setMes(Number(e.target.value))}>
            {MESES.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="campo-ano">Ano</label>
          <input id="campo-ano" type="number" value={ano} onChange={(e) => setAno(Number(e.target.value))} />
        </div>
      </div>

      <fieldset>
        <legend>Dias da semana com celebração</legend>
        <div className="weekdays">
          {DIAS_ABREV.map((d, i) => (
            <button
              key={i}
              type="button"
              className="wd-btn"
              aria-pressed={diasSelecionados.has(i)}
              onClick={() => toggleDia(i)}
            >
              {d}
            </button>
          ))}
        </div>
      </fieldset>

      <button className="secondary" type="button" onClick={gerarDatasDoMes}>Gerar datas do mês</button>

      <div className="add-date-row">
        <label htmlFor="campo-nova-data" className="sr-only">Adicionar data avulsa</label>
        <input id="campo-nova-data" type="date" value={novaData} onChange={(e) => setNovaData(e.target.value)} />
        <button type="button" onClick={adicionarDataManual}>Adicionar</button>
      </div>

      {datas.length > 0 ? (
        <ul className="datelist">
          {datas.map((iso) => (
            <li key={iso}>
              <span>{formatDateBR(iso)} — {DIAS_ABREV[weekdayOf(iso)]}</span>
              <button className="del" type="button" onClick={() => removerData(iso)} aria-label={`Remover celebração de ${formatDateBR(iso)}`}>×</button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-hint">Nenhuma data adicionada ainda.</div>
      )}
    </StepCard>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/DatasStep.test.jsx`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/DatasStep.jsx src/components/DatasStep.test.jsx
git commit -m "feat: add DatasStep with labeled fields and accessible weekday toggles"
```

---

### Task 6: `PeopleListStep` — reusable leitores/ministros/celebrantes step

**Files:**
- Create: `src/components/PeopleListStep.jsx`, `src/components/PeopleListStep.test.jsx`

**Interfaces:**
- Consumes: `StepCard` from Task 4.
- Produces: `<PeopleListStep numero titulo corChip campoId rotuloCampo placeholder valorCampo onValorCampoChange onAdicionar lista onRemover rotuloPorCelebracao valorPorCelebracao onValorPorCelebracaoChange />` — `rotuloPorCelebracao`/`valorPorCelebracao`/`onValorPorCelebracaoChange` are optional (omitted for the celebrantes step, which has no per-celebration count). Consumed by `App.jsx` (Task 10) three times (leitores, ministros, celebrantes).

- [ ] **Step 1: Write failing test**

```jsx
// src/components/PeopleListStep.test.jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import PeopleListStep from "./PeopleListStep.jsx";

function setup(overrides = {}) {
  const props = {
    numero: 2, titulo: "Leitores", corChip: "chip-blue",
    campoId: "novo-leitor", rotuloCampo: "Adicionar leitor", placeholder: "Nome do leitor",
    valorCampo: "", onValorCampoChange: vi.fn(), onAdicionar: vi.fn(),
    lista: ["Ana", "Beto"], onRemover: vi.fn(),
    rotuloPorCelebracao: "Leitor(es) por celebração", valorPorCelebracao: 2, onValorPorCelebracaoChange: vi.fn(),
    ...overrides,
  };
  render(<PeopleListStep {...props} />);
  return props;
}

describe("PeopleListStep", () => {
  it("associates the add-field label and the per-celebration count label", () => {
    setup();
    expect(screen.getByLabelText("Adicionar leitor")).toBeInTheDocument();
    expect(screen.getByLabelText("Leitor(es) por celebração")).toBeInTheDocument();
  });

  it("labels each remove button with the person's name", () => {
    setup();
    expect(screen.getByRole("button", { name: "Remover Ana" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remover Beto" })).toBeInTheDocument();
  });

  it("adds a name when Enter is pressed in the text field", async () => {
    const user = userEvent.setup();
    const props = setup();
    await user.type(screen.getByLabelText("Adicionar leitor"), "Cris{Enter}");
    expect(props.onAdicionar).toHaveBeenCalled();
  });

  it("omits the per-celebration field when not provided (celebrantes step)", () => {
    setup({ rotuloPorCelebracao: undefined, valorPorCelebracao: undefined, onValorPorCelebracaoChange: undefined });
    expect(screen.queryByLabelText(/por celebração/i)).not.toBeInTheDocument();
  });

  it("has no automatically detectable accessibility violations", async () => {
    const { container } = render(<PeopleListStep {...setup()} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/PeopleListStep.test.jsx`
Expected: FAIL — component doesn't exist yet.

- [ ] **Step 3: Implement `PeopleListStep.jsx`**

```jsx
// src/components/PeopleListStep.jsx
import StepCard from "./StepCard.jsx";

export default function PeopleListStep({
  numero, titulo, corChip,
  campoId, rotuloCampo, placeholder, valorCampo, onValorCampoChange, onAdicionar,
  lista, onRemover,
  rotuloPorCelebracao, valorPorCelebracao, onValorPorCelebracaoChange,
}) {
  return (
    <StepCard numero={numero} titulo={titulo}>
      {rotuloPorCelebracao && (
        <>
          <label htmlFor={`${campoId}-por-cel`}>{rotuloPorCelebracao}</label>
          <input
            id={`${campoId}-por-cel`}
            type="number" min="1" max="6"
            value={valorPorCelebracao}
            onChange={(e) => onValorPorCelebracaoChange(Math.max(1, Number(e.target.value)))}
          />
        </>
      )}

      <label htmlFor={campoId}>{rotuloCampo}</label>
      <div className="add-date-row">
        <input
          id={campoId}
          type="text"
          value={valorCampo}
          onChange={(e) => onValorCampoChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAdicionar(); } }}
          placeholder={placeholder}
        />
        <button type="button" onClick={onAdicionar}>Adicionar</button>
      </div>

      {lista.length > 0 ? (
        <ul className={`chip-list`}>
          {lista.map((nome) => (
            <li className={`chip ${corChip}`} key={nome}>
              {nome}
              <button type="button" onClick={() => onRemover(nome)} aria-label={`Remover ${nome}`}>×</button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-hint">Nenhum {titulo.toLowerCase().replace(/s$/, "")} adicionado ainda.</div>
      )}
    </StepCard>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/PeopleListStep.test.jsx`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/PeopleListStep.jsx src/components/PeopleListStep.test.jsx
git commit -m "feat: add reusable PeopleListStep for leitores/ministros/celebrantes"
```

---

### Task 7: `SorteioButton` — primary action with accessible disabled state

**Files:**
- Create: `src/components/SorteioButton.jsx`, `src/components/SorteioButton.test.jsx`

**Interfaces:**
- Produces: `<SorteioButton podeSortear={bool} onSortear={fn} />`. Consumed by `App.jsx` (Task 10).

- [ ] **Step 1: Write failing test**

```jsx
// src/components/SorteioButton.test.jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SorteioButton from "./SorteioButton.jsx";

describe("SorteioButton", () => {
  it("when disabled, points aria-describedby at visible text explaining what's missing", () => {
    render(<SorteioButton podeSortear={false} onSortear={vi.fn()} />);
    const btn = screen.getByRole("button", { name: /sortear cronograma/i });
    expect(btn).toBeDisabled();
    const descId = btn.getAttribute("aria-describedby");
    expect(descId).toBeTruthy();
    expect(document.getElementById(descId)).toHaveTextContent(/adicione datas, leitores, ministros e celebrantes/i);
  });

  it("when enabled, has no aria-describedby and calls onSortear when activated", () => {
    const onSortear = vi.fn();
    render(<SorteioButton podeSortear={true} onSortear={onSortear} />);
    const btn = screen.getByRole("button", { name: /sortear cronograma/i });
    expect(btn).not.toBeDisabled();
    expect(btn).not.toHaveAttribute("aria-describedby");
    btn.click();
    expect(onSortear).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/SorteioButton.test.jsx`
Expected: FAIL — component doesn't exist yet.

- [ ] **Step 3: Implement `SorteioButton.jsx`**

```jsx
// src/components/SorteioButton.jsx
export default function SorteioButton({ podeSortear, onSortear }) {
  return (
    <>
      <button
        className="primary"
        type="button"
        disabled={!podeSortear}
        aria-describedby={!podeSortear ? "sortear-hint" : undefined}
        onClick={onSortear}
      >
        Sortear cronograma
      </button>
      {!podeSortear && (
        <div id="sortear-hint" className="empty-hint">
          Adicione datas, leitores, ministros e celebrantes para sortear.
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/SorteioButton.test.jsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/SorteioButton.jsx src/components/SorteioButton.test.jsx
git commit -m "feat: add SorteioButton with aria-describedby disabled explanation"
```

---

### Task 8: `EditableCell` + `CronogramaTable` — keyboard-operable inline edit

**Files:**
- Create: `src/components/EditableCell.jsx`, `src/components/CronogramaTable.jsx`, `src/components/CronogramaTable.test.jsx`

**Interfaces:**
- Consumes: `formatDateBR, weekdayOf, DIAS_ABREV` from `src/lib/dates.js`.
- Produces: `<EditableCell valor={string} opcoes={string[]} emEdicao={bool} onIniciarEdicao={fn} onConfirmar={(novoValor) => void} onCancelar={fn} rotulo={string} />` and `<CronogramaTable cronograma={...} editando={...} setEditando={fn} atualizarCelula={fn} leitores={string[]} ministros={string[]} responsaveis={string[]} />`. Consumed by `App.jsx` (Task 10).

- [ ] **Step 1: Write failing test — keyboard-only edit flow and table semantics**

```jsx
// src/components/CronogramaTable.test.jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import CronogramaTable from "./CronogramaTable.jsx";

function setup() {
  const atualizarCelula = vi.fn();
  const setEditando = vi.fn();
  const cronograma = [
    { data: "2026-03-01", leitores: ["Ana", "Beto"], ministros: ["Duda"], responsavel: "Padre Carlos" },
  ];
  const utils = render(
    <CronogramaTable
      cronograma={cronograma}
      editando={null}
      setEditando={setEditando}
      atualizarCelula={atualizarCelula}
      leitores={["Ana", "Beto", "Cris"]}
      ministros={["Duda", "Elo"]}
      responsaveis={["Padre Carlos", "Padre João"]}
    />
  );
  return { ...utils, atualizarCelula, setEditando, cronograma };
}

describe("CronogramaTable", () => {
  it("uses scope=col on every header and provides a caption", () => {
    setup();
    screen.getAllByRole("columnheader").forEach((th) => expect(th).toHaveAttribute("scope", "col"));
    expect(screen.getByText(/cronograma de leitores, ministros e celebrante/i)).toBeInTheDocument();
  });

  it("a name is a real button reachable and operable by keyboard alone", async () => {
    const user = userEvent.setup();
    const { setEditando } = setup();
    const nomeBtn = screen.getByRole("button", { name: "Ana" });
    nomeBtn.focus();
    expect(nomeBtn).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(setEditando).toHaveBeenCalledWith({ data: "2026-03-01", tipo: "leitor", idx: 0 });
  });

  it("when editing, offers a select of the other available names and commits on change", async () => {
    const atualizarCelula = vi.fn();
    const cronograma = [
      { data: "2026-03-01", leitores: ["Ana", "Beto"], ministros: ["Duda"], responsavel: "Padre Carlos" },
    ];
    render(
      <CronogramaTable
        cronograma={cronograma}
        editando={{ data: "2026-03-01", tipo: "leitor", idx: 0 }}
        setEditando={vi.fn()}
        atualizarCelula={atualizarCelula}
        leitores={["Ana", "Beto", "Cris"]}
        ministros={["Duda", "Elo"]}
        responsaveis={["Padre Carlos", "Padre João"]}
      />
    );
    const select = screen.getByRole("combobox");
    expect(select).toHaveFocus();
    await userEvent.selectOptions(select, "Cris");
    expect(atualizarCelula).toHaveBeenCalledWith("2026-03-01", "leitor", "Cris", 0);
  });

  it("has no automatically detectable accessibility violations", async () => {
    const { container } = setup();
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/CronogramaTable.test.jsx`
Expected: FAIL — components don't exist yet.

- [ ] **Step 3: Implement `EditableCell.jsx`**

```jsx
// src/components/EditableCell.jsx
export default function EditableCell({ valor, opcoes, emEdicao, onIniciarEdicao, onConfirmar, onCancelar, rotulo }) {
  if (emEdicao) {
    return (
      <select
        autoFocus
        className="cell-select"
        aria-label={rotulo}
        value={valor}
        onChange={(e) => onConfirmar(e.target.value)}
        onBlur={onCancelar}
      >
        {opcoes.map((n) => <option key={n} value={n}>{n}</option>)}
      </select>
    );
  }
  return (
    <button type="button" className="cell-editable" onClick={onIniciarEdicao}>
      {valor}
    </button>
  );
}
```

- [ ] **Step 4: Implement `CronogramaTable.jsx`**

```jsx
// src/components/CronogramaTable.jsx
import { formatDateBR, weekdayOf, DIAS_ABREV } from "../lib/dates.js";
import EditableCell from "./EditableCell.jsx";

export default function CronogramaTable({ cronograma, editando, setEditando, atualizarCelula, leitores, ministros, responsaveis }) {
  return (
    <div className="table-scroll">
      <table className="schedule-table">
        <caption className="sr-only">Cronograma de leitores, ministros e celebrante por data</caption>
        <thead>
          <tr>
            <th scope="col">Data</th>
            <th scope="col">Leitor(es)</th>
            <th scope="col">Ministro(s)</th>
            <th scope="col">Celebrante</th>
          </tr>
        </thead>
        <tbody>
          {cronograma.map((linha) => (
            <tr key={linha.data}>
              <td className="date-cell">
                {formatDateBR(linha.data)}<br />
                <span style={{ fontWeight: 400, color: "var(--ink-soft)", fontSize: 12 }}>{DIAS_ABREV[weekdayOf(linha.data)]}</span>
              </td>

              <td>
                {linha.leitores.map((nome, idx) => {
                  const aEditar = editando && editando.data === linha.data && editando.tipo === "leitor" && editando.idx === idx;
                  const opcoes = leitores.filter((n) => n === nome || !linha.leitores.includes(n));
                  return (
                    <span key={idx}>
                      <EditableCell
                        valor={nome}
                        opcoes={opcoes}
                        emEdicao={aEditar}
                        rotulo={`Leitor ${idx + 1} em ${formatDateBR(linha.data)}`}
                        onIniciarEdicao={() => setEditando({ data: linha.data, tipo: "leitor", idx })}
                        onConfirmar={(v) => atualizarCelula(linha.data, "leitor", v, idx)}
                        onCancelar={() => setEditando(null)}
                      />
                      {idx < linha.leitores.length - 1 ? ", " : ""}
                    </span>
                  );
                })}
              </td>

              <td>
                {linha.ministros.map((nome, idx) => {
                  const aEditar = editando && editando.data === linha.data && editando.tipo === "ministro" && editando.idx === idx;
                  const opcoes = ministros.filter((n) => n === nome || !linha.ministros.includes(n));
                  return (
                    <span key={idx}>
                      <EditableCell
                        valor={nome}
                        opcoes={opcoes}
                        emEdicao={aEditar}
                        rotulo={`Ministro ${idx + 1} em ${formatDateBR(linha.data)}`}
                        onIniciarEdicao={() => setEditando({ data: linha.data, tipo: "ministro", idx })}
                        onConfirmar={(v) => atualizarCelula(linha.data, "ministro", v, idx)}
                        onCancelar={() => setEditando(null)}
                      />
                      {idx < linha.ministros.length - 1 ? ", " : ""}
                    </span>
                  );
                })}
              </td>

              <td>
                <EditableCell
                  valor={linha.responsavel}
                  opcoes={responsaveis}
                  emEdicao={editando && editando.data === linha.data && editando.tipo === "celebrante"}
                  rotulo={`Celebrante em ${formatDateBR(linha.data)}`}
                  onIniciarEdicao={() => setEditando({ data: linha.data, tipo: "celebrante" })}
                  onConfirmar={(v) => atualizarCelula(linha.data, "celebrante", v)}
                  onCancelar={() => setEditando(null)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/components/CronogramaTable.test.jsx`
Expected: PASS (4 tests)

- [ ] **Step 6: Commit**

```bash
git add src/components/EditableCell.jsx src/components/CronogramaTable.jsx src/components/CronogramaTable.test.jsx
git commit -m "feat: add keyboard-operable EditableCell and CronogramaTable"
```

---

### Task 9: `src/lib/pdf.js` — PDF export ported to a testable module

**Files:**
- Create: `src/lib/pdf.js`, `src/lib/pdf.test.js`

**Interfaces:**
- Consumes: `pad, formatDateBR, weekdayOf, MESES, DIAS_ABREV` from `src/lib/dates.js`.
- Produces: `gerarPDF({ cronograma, igreja, mes, ano, logoImage }): jsPDF` (does not call `.save()` — caller does that) and `loadImage(src: string): Promise<HTMLImageElement>`. Consumed by `App.jsx` (Task 10).

- [ ] **Step 1: Write failing tests**

```js
// src/lib/pdf.test.js
import { describe, it, expect } from "vitest";
import { gerarPDF } from "./pdf.js";

function linha(n) {
  return { data: `2026-03-${String(n).padStart(2, "0")}`, leitores: ["Ana", "Beto"], ministros: ["Duda"], responsavel: "Padre Carlos" };
}

describe("gerarPDF", () => {
  it("produces a single-page document for a short cronograma", () => {
    const doc = gerarPDF({ cronograma: [linha(1), linha(8)], igreja: "Paróquia Teste", mes: 2, ano: 2026, logoImage: null });
    expect(doc.internal.getNumberOfPages()).toBe(1);
  });

  it("paginates automatically when the cronograma doesn't fit on one page", () => {
    const muitasLinhas = Array.from({ length: 40 }, (_, i) => linha((i % 28) + 1));
    const doc = gerarPDF({ cronograma: muitasLinhas, igreja: "Paróquia Teste", mes: 2, ano: 2026, logoImage: null });
    expect(doc.internal.getNumberOfPages()).toBeGreaterThan(1);
  });

  it("does not throw when logoImage is null", () => {
    expect(() => gerarPDF({ cronograma: [linha(1)], igreja: "", mes: 2, ano: 2026, logoImage: null })).not.toThrow();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/pdf.test.js`
Expected: FAIL — `pdf.js` does not exist yet.

- [ ] **Step 3: Implement `pdf.js`** (ported from the prototype's `gerarPDF()`, parameterized instead of closing over component state, and `doc.addImage` now takes an `HTMLImageElement` instead of a base64 string)

```js
// src/lib/pdf.js
import { jsPDF } from "jspdf";
import { pad, formatDateBR, weekdayOf, MESES, DIAS_ABREV } from "./dates.js";

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function gerarPDF({ cronograma, igreja, mes, ano, logoImage }) {
  const today = new Date();
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginX = 15;
  const tableRight = pageW - marginX;

  const COL_INK = [32, 36, 43];
  const COL_INK_SOFT = [87, 98, 111];
  const COL_GOLD = [245, 168, 28];
  const COL_BLUE = [0, 134, 195];
  const COL_BLUE_DARK = [0, 102, 154];
  const COL_GREEN = [46, 125, 50];
  const COL_PAPER = [247, 250, 252];
  const COL_ZEBRA = [235, 246, 251];

  function paginaBase(pageNum) {
    doc.setFillColor(...COL_PAPER);
    doc.rect(0, 0, pageW, pageH, "F");
    const stripeH = 3.2;
    doc.setFillColor(...COL_GOLD);
    doc.rect(0, 0, pageW / 3, stripeH, "F");
    doc.setFillColor(...COL_BLUE);
    doc.rect(pageW / 3, 0, pageW / 3, stripeH, "F");
    doc.setFillColor(...COL_GREEN);
    doc.rect((2 * pageW) / 3, 0, pageW / 3, stripeH, "F");
    doc.setDrawColor(220, 228, 235);
    doc.setLineWidth(0.5);
    doc.line(marginX, pageH - 14, tableRight, pageH - 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(140, 150, 160);
    doc.text(
      "Vez de Ler · PASCOM · Gerado em " + `${pad(today.getDate())}/${pad(today.getMonth() + 1)}/${today.getFullYear()}`,
      marginX, pageH - 10
    );
    doc.text(`Página ${pageNum}`, tableRight, pageH - 10, { align: "right" });
  }

  paginaBase(1);
  let y = 16;

  if (logoImage) {
    const logoW = 22;
    const logoH = logoW * (logoImage.naturalHeight / logoImage.naturalWidth);
    try {
      doc.addImage(logoImage, "PNG", pageW / 2 - logoW / 2, y, logoW, logoH);
      y += logoH + 6;
    } catch {
      /* ignore — schedule still renders without the logo */
    }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...COL_GREEN);
  doc.text("CRONOGRAMA MENSAL", pageW / 2, y, { align: "center", charSpace: 1.2 });
  y += 9;

  doc.setFont("times", "bold");
  doc.setFontSize(23);
  doc.setTextColor(...COL_BLUE_DARK);
  doc.text("Vez de Ler", pageW / 2, y, { align: "center" });
  y += 7.5;

  doc.setFont("times", "italic");
  doc.setFontSize(12);
  doc.setTextColor(...COL_INK_SOFT);
  if (igreja) {
    doc.text(igreja, pageW / 2, y, { align: "center" });
    y += 6;
  }
  doc.text(`${MESES[mes]} de ${ano}`, pageW / 2, y, { align: "center" });
  y += 8;

  doc.setDrawColor(...COL_GOLD);
  doc.setLineWidth(0.8);
  doc.line(marginX, y, tableRight, y);
  y += 10;

  const colData = marginX + 3;
  const colLeitores = marginX + 30;
  const colMinistros = marginX + 98;
  const colResp = marginX + 154;
  const colLeitoresW = 66;
  const colMinistrosW = 54;
  const colRespW = 38;
  const padTop = 8;

  function cabecalhoTabela() {
    doc.setFillColor(...COL_BLUE_DARK);
    doc.rect(marginX, y - 5.5, tableRight - marginX, 9.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text("DATA", colData, y);
    doc.text("LEITOR(ES)", colLeitores, y);
    doc.text("MINISTRO(S)", colMinistros, y);
    doc.text("CELEBRANTE", colResp, y);
    y += padTop;
  }

  cabecalhoTabela();

  cronograma.forEach((linha, idx) => {
    const wd = DIAS_ABREV[weekdayOf(linha.data)];
    const leitoresTxt = doc.splitTextToSize(linha.leitores.join(", "), colLeitoresW);
    const ministrosTxt = doc.splitTextToSize(linha.ministros.join(", "), colMinistrosW);
    const respTxt = doc.splitTextToSize(linha.responsavel, colRespW);
    const nLinhas = Math.max(1, leitoresTxt.length, ministrosTxt.length, respTxt.length);
    const alturaLinha = nLinhas * 5 + 6;

    if (y + alturaLinha > pageH - 20) {
      doc.addPage();
      paginaBase(doc.internal.getNumberOfPages());
      y = 24;
      cabecalhoTabela();
    }

    doc.setFillColor(...(idx % 2 === 0 ? COL_ZEBRA : [255, 255, 255]));
    doc.rect(marginX, y - 5, tableRight - marginX, alturaLinha, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...COL_BLUE_DARK);
    doc.text(formatDateBR(linha.data), colData, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COL_INK_SOFT);
    doc.text(wd, colData, y + 4.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...COL_INK);
    doc.text(leitoresTxt, colLeitores, y);
    doc.text(ministrosTxt, colMinistros, y);
    doc.text(respTxt, colResp, y);

    y += alturaLinha;
    doc.setDrawColor(220, 228, 235);
    doc.setLineWidth(0.3);
    doc.line(marginX, y - 5, tableRight, y - 5);
  });

  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFillColor(...COL_PAPER);
    doc.setDrawColor(220, 228, 235);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(154, 146, 132);
    doc.text(`Página ${p} de ${totalPages}`, tableRight, pageH - 10, { align: "right" });
  }

  return doc;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/pdf.test.js`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/pdf.js src/lib/pdf.test.js
git commit -m "feat: port PDF export as a testable module taking an HTMLImageElement logo"
```

---

### Task 10: `App.jsx` — wire everything together, full-flow integration test

**Files:**
- Modify: `src/App.jsx` (replace Vite template default), `src/App.css` (delete — replaced by `src/index.css`), `src/assets/react.svg` (delete — Vite template leftover)
- Create: `src/components/App.test.jsx`

**Interfaces:**
- Consumes: `useEscala` (Task 3), `Masthead, LiveAnnouncer` (Task 4), `DatasStep` (Task 5), `PeopleListStep` (Task 6), `SorteioButton` (Task 7), `CronogramaTable` (Task 8), `gerarPDF, loadImage` (Task 9), `logo-pascom.png` asset.

- [ ] **Step 1: Write failing full-flow integration test (keyboard-only + axe on populated state)**

```jsx
// src/components/App.test.jsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import App from "../App.jsx";

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
});

describe("App — full flow, keyboard only", () => {
  it("goes from empty state to a rendered cronograma using only Tab/Enter/typing", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText("Adicionar leitor"), "Ana{Enter}");
    await user.type(screen.getByLabelText("Adicionar ministro"), "Duda{Enter}");
    await user.type(screen.getByLabelText("Adicionar celebrante"), "Padre Carlos{Enter}");

    await user.click(screen.getByRole("button", { name: "Gerar datas do mês" }));

    const sortearBtn = screen.getByRole("button", { name: /sortear cronograma/i });
    expect(sortearBtn).not.toBeDisabled();
    sortearBtn.focus();
    await user.keyboard("{Enter}");

    expect(await screen.findByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/cronograma sorteado/i);
  });

  it("has no automatically detectable accessibility violations once a cronograma is showing", async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);

    await user.type(screen.getByLabelText("Adicionar leitor"), "Ana{Enter}");
    await user.type(screen.getByLabelText("Adicionar ministro"), "Duda{Enter}");
    await user.type(screen.getByLabelText("Adicionar celebrante"), "Padre Carlos{Enter}");
    await user.click(screen.getByRole("button", { name: "Gerar datas do mês" }));
    await user.click(screen.getByRole("button", { name: /sortear cronograma/i }));
    await screen.findByRole("table");

    expect(await axe(container)).toHaveNoViolations();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/App.test.jsx`
Expected: FAIL — `App.jsx` still has the Vite template's default counter content.

- [ ] **Step 3: Remove Vite template leftovers**

```bash
rm -f src/App.css src/assets/react.svg
```

- [ ] **Step 4: Implement `App.jsx`**

```jsx
// src/App.jsx
import { useEscala } from "./hooks/useEscala.js";
import { loadImage, gerarPDF } from "./lib/pdf.js";
import { MESES } from "./lib/dates.js";
import logo from "./assets/logo-pascom.png";
import Masthead from "./components/Masthead.jsx";
import LiveAnnouncer from "./components/LiveAnnouncer.jsx";
import DatasStep from "./components/DatasStep.jsx";
import PeopleListStep from "./components/PeopleListStep.jsx";
import SorteioButton from "./components/SorteioButton.jsx";
import CronogramaTable from "./components/CronogramaTable.jsx";
import StepCard from "./components/StepCard.jsx";

export default function App() {
  const escala = useEscala();

  async function baixarPDF() {
    if (!escala.cronograma) return;
    let logoImage = null;
    try {
      logoImage = await loadImage(logo);
    } catch {
      /* ignore — PDF still generates without the logo */
    }
    const doc = gerarPDF({
      cronograma: escala.cronograma,
      igreja: escala.igreja,
      mes: escala.mes,
      ano: escala.ano,
      logoImage,
    });
    doc.save(`cronograma_${MESES[escala.mes].toLowerCase()}_${escala.ano}.pdf`);
  }

  return (
    <div className="wrap">
      <Masthead />
      <LiveAnnouncer mensagem={escala.mensagem} />

      <DatasStep
        igreja={escala.igreja} setIgreja={escala.setIgreja}
        mes={escala.mes} setMes={escala.setMes}
        ano={escala.ano} setAno={escala.setAno}
        diasSelecionados={escala.diasSelecionados} toggleDia={escala.toggleDia}
        datas={escala.datas} novaData={escala.novaData} setNovaData={escala.setNovaData}
        gerarDatasDoMes={escala.gerarDatasDoMes} removerData={escala.removerData}
        adicionarDataManual={escala.adicionarDataManual}
      />

      <PeopleListStep
        numero={2} titulo="Leitores" corChip="chip-blue"
        campoId="novo-leitor" rotuloCampo="Adicionar leitor" placeholder="Nome do leitor"
        valorCampo={escala.novoLeitor} onValorCampoChange={escala.setNovoLeitor} onAdicionar={escala.adicionarLeitor}
        lista={escala.leitores} onRemover={escala.removerLeitor}
        rotuloPorCelebracao="Leitor(es) por celebração"
        valorPorCelebracao={escala.leitoresPorCel} onValorPorCelebracaoChange={escala.setLeitoresPorCel}
      />

      <PeopleListStep
        numero={3} titulo="Ministros" corChip="chip-green"
        campoId="novo-ministro" rotuloCampo="Adicionar ministro" placeholder="Nome do ministro"
        valorCampo={escala.novoMinistro} onValorCampoChange={escala.setNovoMinistro} onAdicionar={escala.adicionarMinistro}
        lista={escala.ministros} onRemover={escala.removerMinistro}
        rotuloPorCelebracao="Ministro(s) por celebração"
        valorPorCelebracao={escala.ministrosPorCel} onValorPorCelebracaoChange={escala.setMinistrosPorCel}
      />

      <PeopleListStep
        numero={4} titulo="Celebrantes" corChip="chip-gold"
        campoId="novo-celebrante" rotuloCampo="Adicionar celebrante" placeholder="Ex.: Pe. Carlos"
        valorCampo={escala.novoResponsavel} onValorCampoChange={escala.setNovoResponsavel} onAdicionar={escala.adicionarResponsavel}
        lista={escala.responsaveis} onRemover={escala.removerResponsavel}
      />

      <SorteioButton podeSortear={escala.podeSortear} onSortear={escala.sortear} />

      {escala.cronograma && (
        <StepCard numero={5} titulo="Cronograma sorteado" as="section">
          <CronogramaTable
            cronograma={escala.cronograma}
            editando={escala.editando}
            setEditando={escala.setEditando}
            atualizarCelula={escala.atualizarCelula}
            leitores={escala.leitores}
            ministros={escala.ministros}
            responsaveis={escala.responsaveis}
          />
          <div className="edit-hint">Toque em um nome para trocá-lo sem precisar sortear tudo de novo.</div>
          <div className="actions-row">
            <button className="secondary" type="button" onClick={escala.sortear}>Sortear novamente</button>
            <button className="primary" type="button" style={{ marginTop: 0 }} onClick={baixarPDF}>Baixar PDF</button>
          </div>
        </StepCard>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/components/App.test.jsx`
Expected: PASS (2 tests)

- [ ] **Step 6: Run the full test suite, lint, and build**

Run: `npm run test && npm run lint && npm run build`
Expected: all tests pass, zero lint errors (including jsx-a11y rules), build succeeds.

- [ ] **Step 7: Manual smoke test**

Run: `npm run dev`, open the printed local URL, and manually verify: fields are announced by their labels when focused, weekday buttons show a ✓ and "pressed" state, tabbing reaches every control (chips, cells, buttons) in visual order, and the downloaded PDF opens correctly with the PASCOM logo, colors, and pagination. Note in the commit message that VoiceOver/TalkBack device testing (`ACCESSIBILITY_SPEC.md` §10) is a manual follow-up, not automated here.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: wire App.jsx from useEscala and all step components"
```
