# SII — STI2D (BO) Markdown → HTML

Petit générateur statique pour convertir des fichiers Markdown (avec frontmatter) en pages HTML intégrant un en-tête et un pied de page adaptés.

Pré-requis
- Node.js 18+ recommandé

Installation
```
npm install
```

Générer les pages
```
npm run build
```

Servir localement
```
npm run serve
```

Structure
- `content/` : fichiers Markdown organisés par compétences
- `templates/` : `header.html`, `footer.html`, `layout.html`
- `dist/` : sortie HTML générée

Prochaine étape : alimenter `content/` avec toutes les compétences/attendus extraits du BO.
