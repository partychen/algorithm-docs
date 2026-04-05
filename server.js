const express = require('express');
const fs = require('fs');
const path = require('path');
const MarkdownIt = require('markdown-it');
const mk = require('@iktakahiro/markdown-it-katex');
const hljs = require('highlight.js');
const matter = require('gray-matter');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DOCS_DIR = path.join(__dirname, 'docs');
const PUBLIC_DIR = path.join(__dirname, 'public');
const FOLDERS_META_FILENAME = '_folders.json';

function slugifyHeading(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff\u3000-\u303f]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseDoc(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data: frontmatter, content } = matter(raw);
  return { frontmatter, content, raw };
}

function extractToc(content) {
  const toc = [];
  const idCount = {};
  for (const line of content.split('\n')) {
    const match = line.match(/^(#{2,3})\s+(.+)/);
    if (!match) continue;
    const rawText = match[2];
    let id = slugifyHeading(rawText);
    idCount[id] = (idCount[id] || 0) + 1;
    if (idCount[id] > 1) id = id + '-' + (idCount[id] - 1);
    toc.push({
      level: match[1].length,
      text: rawText,
      html: md.renderInline(rawText),
      id
    });
  }
  return toc;
}

function listMarkdownFiles(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  return entries.flatMap(entry => {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      return listMarkdownFiles(fullPath);
    }
    return entry.isFile() && entry.name.endsWith('.md') ? [fullPath] : [];
  });
}

function getDocInfo(filePath) {
  const slug = path.relative(DOCS_DIR, filePath).split(path.sep).join('/').replace(/\.md$/i, '');
  const section = path.posix.dirname(slug);

  return {
    slug,
    basename: path.basename(filePath, '.md'),
    section: section === '.' ? '' : section
  };
}

function getDocMeta(frontmatter, basename) {
  const meta = {
    title: (frontmatter.title || basename).trim(),
    subtitle: (frontmatter.subtitle || '').trim()
  };
  if (typeof frontmatter.icon === 'string' && frontmatter.icon.trim()) {
    meta.icon = frontmatter.icon.trim();
  }
  return meta;
}

function normalizeFolderMeta(relativePath, value) {
  const meta = { path: relativePath };

  if (typeof value === 'number' && Number.isFinite(value)) {
    meta.order = value;
    return meta;
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Folder metadata for "${relativePath}" must be a number or object.`);
  }

  if (typeof value.title === 'string' && value.title.trim()) {
    meta.title = value.title.trim();
  }

  const order = Number(value.order);
  if (Number.isFinite(order)) {
    meta.order = order;
  }

  if (typeof value.icon === 'string' && value.icon.trim()) {
    meta.icon = value.icon.trim();
  }

  return meta;
}

function readFoldersJsonFile(filePath, prefix) {
  if (!fs.existsSync(filePath)) return {};

  const raw = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw);
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(`${filePath} must be a JSON object.`);
  }

  return Object.entries(data).reduce((acc, [key, value]) => {
    const normalizedKey = String(key).trim().replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
    if (!normalizedKey) return acc;
    const fullPath = prefix ? `${prefix}/${normalizedKey}` : normalizedKey;
    acc[fullPath] = normalizeFolderMeta(fullPath, value);
    return acc;
  }, {});
}

function getFolderMetaMap() {
  const result = {};

  function scanDir(dirPath, prefix) {
    const metaPath = path.join(dirPath, FOLDERS_META_FILENAME);
    Object.assign(result, readFoldersJsonFile(metaPath, prefix));

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const childPrefix = prefix ? `${prefix}/${entry.name}` : entry.name;
        scanDir(path.join(dirPath, entry.name), childPrefix);
      }
    }
  }

  scanDir(DOCS_DIR, '');
  return result;
}

function getDocs() {
  return listMarkdownFiles(DOCS_DIR)
    .map(filePath => {
      const { frontmatter, content } = parseDoc(filePath);
      const info = getDocInfo(filePath);
      return {
        ...info,
        ...getDocMeta(frontmatter, info.basename),
        order: frontmatter.order ?? Infinity,
        toc: extractToc(content)
      };
    })
    .sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug, 'zh-CN'));
}

function getDocsPayload() {
  return {
    docs: getDocs(),
    folders: getFolderMetaMap()
  };
}

function normalizeDocSlug(input) {
  return String(input || '')
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\/+|\/+$/g, '')
    .replace(/\.md$/i, '');
}

function resolveDocPath(input) {
  const slug = normalizeDocSlug(input);
  if (!slug) return null;

  const fullPath = path.resolve(DOCS_DIR, `${slug}.md`);
  const relative = path.relative(DOCS_DIR, fullPath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    return null;
  }
  return fullPath;
}

// ── Markdown config ──────────────────────────────────────────
let headingIdCount = {};

const md = new MarkdownIt({
  html: true,
  breaks: true,
  highlight(str, lang) {
    const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(str, { language }).value;
  }
});
md.use(mk, { throwOnError: false });

// Custom heading: id + anchor link
md.renderer.rules.heading_open = (tokens, idx) => {
  const token = tokens[idx];
  const level = token.tag; // h1, h2, etc.
  // Get inline content for slug
  const inlineToken = tokens[idx + 1];
  const rawText = inlineToken ? inlineToken.children.map(t => t.content).join('') : '';
  let id = slugifyHeading(rawText);
  headingIdCount[id] = (headingIdCount[id] || 0) + 1;
  if (headingIdCount[id] > 1) id = id + '-' + (headingIdCount[id] - 1);
  token.attrSet('id', id);
  token.attrSet('data-id', id);
  return `<${level} id="${id}">`;
};

md.renderer.rules.heading_close = (tokens, idx) => {
  const level = tokens[idx].tag;
  // Find the matching heading_open to get the id
  let id = '';
  for (let i = idx - 1; i >= 0; i--) {
    if (tokens[i].type === 'heading_open') {
      id = tokens[i].attrGet('id') || '';
      break;
    }
  }
  return `<a class="header-anchor" href="#${id}" aria-hidden="true"></a></${level}>`;
};

// Custom fence: code block with language label + copy button
md.renderer.rules.fence = (tokens, idx) => {
  const token = tokens[idx];
  const lang = token.info.trim();
  const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
  const highlighted = hljs.highlight(token.content, { language }).value;
  return `<div class="code-block"><div class="code-header"><span class="code-lang">${language}</span><button class="copy-btn" onclick="copyCode(this)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg></button></div><pre><code class="hljs language-${language}">${highlighted}</code></pre></div>`;
};

// Custom table: wrap with div.table-wrap
const defaultTableOpen = md.renderer.rules.table_open || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));
md.renderer.rules.table_open = (tokens, idx, options, env, self) => {
  return '<div class="table-wrap">' + defaultTableOpen(tokens, idx, options, env, self);
};

const defaultTableClose = md.renderer.rules.table_close || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));
md.renderer.rules.table_close = (tokens, idx, options, env, self) => {
  return defaultTableClose(tokens, idx, options, env, self) + '</div>';
};

// Custom inline code: add class="inline-code"
md.renderer.rules.code_inline = (tokens, idx) => {
  const token = tokens[idx];
  return `<code class="inline-code">${md.utils.escapeHtml(token.content)}</code>`;
};

// ── Static files ─────────────────────────────────────────────
app.use('/static', express.static(PUBLIC_DIR));
app.use('/static/katex', express.static(path.join(__dirname, 'node_modules', 'katex', 'dist')));

// ── API: list all docs ───────────────────────────────────────
app.get('/api/docs', (req, res) => {
  res.json(getDocsPayload());
});

// ── API: get single doc ──────────────────────────────────────
app.get('/api/doc', (req, res) => {
  const filePath = resolveDocPath(req.query.path);
  if (!filePath) {
    return res.status(404).json({ error: 'Document not found' });
  }

  let frontmatter, content, raw;
  try {
    ({ frontmatter, content, raw } = parseDoc(filePath));
  } catch {
    return res.status(404).json({ error: 'Document not found' });
  }

  const info = getDocInfo(filePath);
  headingIdCount = {};
  let html = md.render(content);

  // Move tag-only paragraphs (containing only inline-code) into the preceding h2 as badges
  html = html.replace(
    /(<h2\b[^>]*>)([\s\S]*?)(<a class="header-anchor"[\s\S]*?<\/a>)(<\/h2>)\s*<p>((?:\s*<code class="inline-code">[\s\S]*?<\/code>\s*)+)<\/p>/g,
    (_, open, text, anchor, close, codes) => {
      const badges = codes.replace(
        /<code class="inline-code">([\s\S]*?)<\/code>/g,
        '<span class="tag-badge">$1</span>'
      );
      return `${open}${text}<span class="tag-badges">${badges}</span>${anchor}${close}`;
    }
  );

  res.json({
    ...info,
    ...getDocMeta(frontmatter, info.basename),
    html,
    toc: extractToc(content),
    raw
  });
});

// ── API: search ──────────────────────────────────────────────
app.get('/api/search', (req, res) => {
  const query = String(req.query.q || '').toLowerCase().trim();
  if (!query) {
    return res.json([]);
  }

  const results = [];
  for (const filePath of listMarkdownFiles(DOCS_DIR)) {
    const { frontmatter, content } = parseDoc(filePath);
    const lowerContent = content.toLowerCase();
    const matchIndex = lowerContent.indexOf(query);
    if (matchIndex === -1) continue;

    const info = getDocInfo(filePath);
    const start = Math.max(0, matchIndex - 40);
    const end = Math.min(content.length, matchIndex + query.length + 80);
    const snippet = (start > 0 ? '...' : '')
      + content.slice(start, end).replace(/\n/g, ' ')
      + (end < content.length ? '...' : '');

    results.push({
      slug: info.slug,
      section: info.section,
      title: getDocMeta(frontmatter, info.basename).title,
      snippet,
      matchIndex
    });
  }

  res.json(results.sort((a, b) => a.matchIndex - b.matchIndex));
});

// ── Serve main page ──────────────────────────────────────────
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  📖 Docs reader running at http://localhost:${PORT}\n`);
});
