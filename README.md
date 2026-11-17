# Structorizer

Create structograms (Nassi-Shneiderman diagrams) in the browser. New version (v2). The
[old version](https://janishuser.github.io/Structorizer/legacy/struct.html) is still available under `legacy/`.

Plain HTML/CSS/JavaScript with no build step: `index.html`, `style.css`, `app.js`.

## Features

- Drag elements (While, DoWhile, For, If, Switch, Instruction, Function call) into the diagram, and drag existing ones to move them
- Click to select, double-click to edit the text
- Multiple diagrams per project (tabs), e.g. for functions
- Undo/redo, autosave to localStorage, download/open project files (`.struct`, JSON)
- Export as Java/C-style code or Python, and as a PNG image

## Run locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Deploy

GitHub Pages: Settings → Pages → Deploy from branch → `master` / `(root)`.
