const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const MarkdownIt = require('markdown-it');

const md = new MarkdownIt({ html: true });

const ROOT = path.resolve(__dirname);
const CONTENT_DIR = path.join(ROOT, 'content');
const TEMPLATES_DIR = path.join(ROOT, 'templates');
const DIST_DIR = path.join(ROOT, 'dist');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readTemplate(name) {
  const p = path.join(TEMPLATES_DIR, name);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
}

function renderPage(meta, contentHtml) {
  const header = readTemplate('header.html');
  const footer = readTemplate('footer.html');
  let layout = readTemplate('layout.html');
  layout = layout.replace(/{{header}}/g, header);
  layout = layout.replace(/{{footer}}/g, footer);
  layout = layout.replace(/{{title}}/g, meta.title || 'Page');
  layout = layout.replace(/{{content}}/g, contentHtml);
  return layout;
}

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

function build() {
  ensureDir(DIST_DIR);
  if (!fs.existsSync(CONTENT_DIR)) {
    console.error('Aucun dossier content/ trouvé.');
    return;
  }
  const mdFiles = walk(CONTENT_DIR).filter(f => f.endsWith('.md'));
  mdFiles.forEach(file => {
    const raw = fs.readFileSync(file, 'utf8');
    const parsed = matter(raw);
    const html = md.render(parsed.content);
    const page = renderPage(parsed.data || {}, html);
    const rel = path.relative(CONTENT_DIR, file);
    const outName = rel.replace(/\.md$/, '.html');
    const outPath = path.join(DIST_DIR, outName);
    ensureDir(path.dirname(outPath));
    fs.writeFileSync(outPath, page, 'utf8');
    console.log('Built', outPath);
  });
  const staticDir = path.join(ROOT, 'static');
  if (fs.existsSync(staticDir)) {
    const destStatic = path.join(DIST_DIR, 'static');
    ensureDir(destStatic);
    fs.cpSync(staticDir, destStatic, { recursive: true });
    console.log('Copied static assets');
  }
}

build();
