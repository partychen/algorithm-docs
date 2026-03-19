const express = require('express');
const fs = require('fs');
const path = require('path');
const { Marked } = require('marked');
const hljs = require('highlight.js');
const matter = require('gray-matter');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DOCS_DIR = path.join(__dirname, 'docs');
const PUBLIC_DIR = path.join(__dirname, 'public');

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
  for (const line of content.split('\n')) {
    const match = line.match(/^(#{2,3})\s+(.+)/);
    if (!match) continue;
    toc.push({
      level: match[1].length,
      text: match[2],
      id: slugifyHeading(match[2])
    });
  }
  return toc;
}

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/');
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
  const relativeFilePath = toPosixPath(path.relative(DOCS_DIR, filePath));
  const slug = relativeFilePath.replace(/\.md$/i, '');
  const section = path.posix.dirname(slug);

  return {
    slug,
    filename: path.basename(filePath),
    relativeFilePath,
    basename: path.basename(filePath, '.md'),
    section: section === '.' ? '' : section,
    segments: slug.split('/').filter(Boolean)
  };
}

function getDocs() {
  return listMarkdownFiles(DOCS_DIR)
    .map(filePath => {
      const { frontmatter, content } = parseDoc(filePath);
      const info = getDocInfo(filePath);
      return {
        ...info,
        title: (frontmatter.title || info.basename).trim(),
        subtitle: (frontmatter.subtitle || '').trim(),
        order: frontmatter.order ?? Infinity,
        toc: extractToc(content)
      };
    })
    .sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug, 'zh-CN'));
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
const marked = new Marked({
  gfm: true,
  breaks: false,
  renderer: {
    heading({ tokens, depth }) {
      const text = this.parser.parseInline(tokens);
      const raw = tokens.map(token => token.raw || token.text || '').join('');
      const id = slugifyHeading(raw);
      return `<h${depth} id="${id}">${text}<a class="header-anchor" href="#${id}" aria-hidden="true"></a></h${depth}>`;
    },
    code({ text, lang }) {
      const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
      const highlighted = hljs.highlight(text, { language }).value;
      return `<div class="code-block"><div class="code-header"><span class="code-lang">${language}</span><button class="copy-btn" onclick="copyCode(this)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg></button></div><pre><code class="hljs language-${language}">${highlighted}</code></pre></div>`;
    },
    table({ header, rows }) {
      const headerCells = header.map(cell => {
        const content = this.parser.parseInline(cell.tokens);
        return `<th>${content}</th>`;
      }).join('');
      const bodyRows = rows.map(row => {
        const cells = row.map(cell => {
          const content = this.parser.parseInline(cell.tokens);
          return `<td>${content}</td>`;
        }).join('');
        return `<tr>${cells}</tr>`;
      }).join('');
      return `<div class="table-wrap"><table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table></div>`;
    },
    codespan({ text }) {
      return `<code class="inline-code">${text}</code>`;
    }
  }
});

// ── Static files ─────────────────────────────────────────────
app.use('/static', express.static(PUBLIC_DIR));

// ── API: list all docs ───────────────────────────────────────
app.get('/api/docs', (req, res) => {
  res.json(getDocs());
});

// ── API: get single doc ──────────────────────────────────────
app.get('/api/doc', (req, res) => {
  const filePath = resolveDocPath(req.query.path);
  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Document not found' });
  }

  const { frontmatter, content, raw } = parseDoc(filePath);
  const info = getDocInfo(filePath);
  res.json({
    ...info,
    title: (frontmatter.title || info.basename).trim(),
    subtitle: (frontmatter.subtitle || '').trim(),
    html: marked.parse(content),
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
      title: (frontmatter.title || info.basename).trim(),
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
