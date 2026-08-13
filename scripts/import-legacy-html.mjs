import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CONTENT_ROOT = path.join(ROOT, 'content');
const OUT_BLOG = path.join(ROOT, 'src', 'content', 'blog');
const OUT_PAGES = path.join(ROOT, 'src', 'content', 'pages');
const PUBLIC_IMAGES = path.join(ROOT, 'public', 'images', 'legacy');

const CATEGORY_MAP = {
  architecture: 'Architecture',
  events: 'Events',
  tips_and_tricks: 'Tips and Tricks',
  tools: 'Tools',
};

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function decodeEntities(text) {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function stripTags(html) {
  return decodeEntities(html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

function extractBetween(html, startRe, endRe) {
  const start = html.search(startRe);
  if (start < 0) return null;
  const after = html.slice(start);
  const endMatch = after.search(endRe);
  if (endMatch < 0) return after;
  return after.slice(0, endMatch);
}

function extractTitle(html, fallback) {
  const titleTag = html.match(/<title>([\s\S]*?)<\/title>/i);
  if (titleTag) {
    const t = stripTags(titleTag[1])
      .replace(/\s*[|–-]\s*Martin Toshev.*$/i, '')
      .replace(/\s*[|–-]\s*Algorithms.*$/i, '')
      .trim();
    if (t) return t;
  }

  const item = extractItemPage(html);
  const h2 = item?.match(/<h2[^>]*>\s*(?:<a[^>]*>)?([\s\S]*?)(?:<\/a>)?\s*<\/h2>/i);
  if (h2) {
    const t = stripTags(h2[1]).trim();
    if (t) return t;
  }

  return fallback;
}

function extractDate(html) {
  const published = html.match(/Published on\s+[^,<]+,\s+(\d{1,2}\s+\w+\s+\d{4})/i);
  if (published) {
    const d = new Date(published[1]);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  const datetime = html.match(/datetime="(\d{4}-\d{2}-\d{2})/i);
  if (datetime) return datetime[1];
  return '2015-01-01';
}

function extractItemPage(html) {
  const start = html.search(/class="[^"]*item-page[^"]*"/i);
  if (start < 0) {
    const article = html.match(/<article[\s\S]*?<\/article>/i);
    return article ? article[0] : html;
  }
  // Find the opening tag containing item-page, then take until next major section or footer.
  const from = html.slice(start);
  const openTagEnd = from.indexOf('>');
  let body = from.slice(openTagEnd + 1);
  const cutPoints = [
    body.search(/<div[^>]+id="system-message/i),
    body.search(/<div[^>]+class="[^"]*footer/i),
    body.search(/<\/body>/i),
    body.search(/<div[^>]+id="footer/i),
  ].filter((n) => n >= 0);
  if (cutPoints.length) body = body.slice(0, Math.min(...cutPoints));
  return body;
}

function cleanHtml(body, assetDirName, slug, categoryFolder) {
  let html = body;

  // Drop the Joomla page title (rendered by Navfolio frontmatter)
  html = html.replace(/^\s*<h2[\s\S]*?<\/h2>/i, '');
  // Drop article info / social / scripts / styles / forms / TOC index
  html = html.replace(/<div[^>]+id="article-index"[\s\S]*?<\/div>/gi, '');
  html = html.replace(/<dl[^>]*class="[^"]*article-info[\s\S]*?<\/dl>/gi, '');
  html = html.replace(/<ul[^>]+class="[^"]*actions[\s\S]*?<\/ul>/gi, '');
  html = html.replace(/<div[^>]+class="[^"]*share[\s\S]*?<\/div>/gi, '');
  html = html.replace(/<div[^>]+id="fb-root"[\s\S]*?<\/div>/gi, '');
  html = html.replace(/<p[^>]*>\s*(?:<span[^>]*>\s*(?:&nbsp;|\s)*<\/span>\s*)+<\/p>/gi, '');
  html = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<style[\s\S]*?<\/style>/gi, '');
  html = html.replace(/<!--[\s\S]*?-->/g, '');
  html = html.replace(/<iframe[\s\S]*?<\/iframe>/gi, '');
  html = html.replace(/<noscript[\s\S]*?<\/noscript>/gi, '');
  html = html.replace(/<img[^>]+printButton\.png[^>]*>/gi, '');
  html = html.replace(/<ul[^>]*class="[^"]*pagenav[\s\S]*?<\/ul>/gi, '');
  html = html.replace(/<div[^>]*class="[^"]*cmp_[^"]*"[\s\S]*?<\/div>/gi, '');
  html = html.replace(/<fb:[^>]*>[\s\S]*?<\/fb:[^>]+>/gi, '');
  html = html.replace(/<\/?fb:[^>]*>/gi, '');
  html = html.replace(/<\/?g:[^>]*>/gi, '');
  html = html.replace(/\s+onclick="[^"]*"/gi, '');
  html = html.replace(/\s+onmouseover="[^"]*"/gi, '');
  html = html.replace(/\s+style="[^"]*"/gi, '');
  html = html.replace(/\s+class="[^"]*"/gi, '');
  html = html.replace(/<span>\s*<\/span>/gi, '');
  html = html.replace(/<(p|div|span)>\s*(?:&nbsp;|\s)*<\/\1>/gi, '');

  // Rewrite local image paths from *_files folders
  const filesPrefix = `${assetDirName}_files/`;
  html = html.replace(
    new RegExp(`(?:\\.\\.?/)?${escapeRegExp(filesPrefix)}([^"'\\s>]+)`, 'gi'),
    (_m, file) => `/images/legacy/${categoryFolder}/${slug}/${path.basename(file)}`,
  );
  html = html.replace(/src="(?:\.\/)?([^"]+_files\/[^"]+)"/gi, (_m, rel) => {
    const base = path.basename(rel);
    return `src="/images/legacy/${categoryFolder}/${slug}/${base}"`;
  });
  // Also rewrite leftover relative image paths that already point into copied assets
  html = html.replace(
    /src="\.\/images\/legacy\//g,
    'src="/images/legacy/',
  );

  // Convert syntaxhighlighter blocks to fenced code
  html = html.replace(
    /<pre[^>]*brush:\s*([^;"\s]+)[^>]*>([\s\S]*?)<\/pre>/gi,
    (_m, lang, code) => {
      const text = decodeEntities(code.replace(/<[^>]+>/g, ''));
      return `\n\`\`\`${lang.trim()}\n${text.trim()}\n\`\`\`\n`;
    },
  );

  // Drop trailing chrome / empty wrappers
  html = html.replace(/<\/div>\s*$/g, '');
  html = html.replace(/(?:<\/div>\s*){2,}$/g, '');
  // Normalize whitespace a bit
  html = html.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  return html;
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function copyImages(sourceFilesDir, destDir) {
  if (!fs.existsSync(sourceFilesDir)) return 0;
  fs.mkdirSync(destDir, { recursive: true });
  let count = 0;
  for (const name of fs.readdirSync(sourceFilesDir)) {
    const lower = name.toLowerCase();
    if (!/\.(png|jpe?g|gif|webp|svg)$/i.test(lower)) continue;
    fs.copyFileSync(path.join(sourceFilesDir, name), path.join(destDir, name));
    count += 1;
  }
  return count;
}

function yamlEscape(value) {
  if (/[:#\[\]{},&*?|!<>=%@`]/.test(value) || value.includes("'") || value.includes('"')) {
    return JSON.stringify(value);
  }
  return value;
}

function writeMarkdown({ outPath, title, description, date, categories, tags, body, sidebar = true }) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const fm = [
    '---',
    `title: ${yamlEscape(title)}`,
    `description: ${yamlEscape(description)}`,
    `date: '${date}'`,
    'draft: false',
    'showHeroImage: false',
    `tags: [${tags.map((t) => yamlEscape(t)).join(', ')}]`,
    `categories: [${categories.map((c) => yamlEscape(c)).join(', ')}]`,
    'comments: false',
    'sidebar:',
    `  enable: ${sidebar}`,
    `  toc: ${sidebar}`,
    '  relatedPosts: true',
    '---',
    '',
    body,
    '',
  ].join('\n');
  fs.writeFileSync(outPath, fm, 'utf8');
}

function firstParagraphText(html) {
  const paragraphs = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
  for (const p of paragraphs) {
    const text = stripTags(p[1]);
    if (text.length > 40) {
      return text.length > 180 ? `${text.slice(0, 177)}...` : text;
    }
  }
  const fallback = stripTags(html).slice(0, 160);
  return fallback || 'Article from martin-toshev.com';
}

function importBlogArticles() {
  const blogRoot = path.join(CONTENT_ROOT, 'blog');
  let imported = 0;

  for (const [folder, category] of Object.entries(CATEGORY_MAP)) {
    const dir = path.join(blogRoot, folder);
    if (!fs.existsSync(dir)) continue;

    for (const name of fs.readdirSync(dir)) {
      if (!/\.html?$/i.test(name)) continue;
      if (name.includes('_files')) continue;

      const filePath = path.join(dir, name);
      const html = fs.readFileSync(filePath, 'utf8');
      const title = extractTitle(html, name.replace(/\.html?$/i, ''));
      const slug = slugify(title);
      const date = extractDate(html);
      const assetBase = name.replace(/\.html?$/i, '');
      const filesDir = path.join(dir, `${assetBase}_files`);
      const rawBody = extractItemPage(html);
      const body = cleanHtml(rawBody, assetBase, slug, folder);
      const description = firstParagraphText(body) || title;

      copyImages(filesDir, path.join(PUBLIC_IMAGES, folder, slug));

      const outPath = path.join(OUT_BLOG, folder.replace(/_/g, '-'), `${slug}.md`);
      writeMarkdown({
        outPath,
        title,
        description,
        date,
        categories: [category],
        tags: [category],
        body,
      });
      imported += 1;
      console.log(`blog: ${category} -> ${outPath}`);
    }
  }

  return imported;
}

function importStandalonePage({ source, outName, titleOverride, description }) {
  const html = fs.readFileSync(source, 'utf8');
  const title = titleOverride || extractTitle(html, outName);
  const date = extractDate(html);
  const assetBase = path.basename(source).replace(/\.html?$/i, '');
  const filesDir = path.join(path.dirname(source), `${assetBase}_files`);
  const slug = slugify(outName);
  const rawBody = extractItemPage(html);
  const body = cleanHtml(rawBody, assetBase, slug, outName);

  copyImages(filesDir, path.join(PUBLIC_IMAGES, outName, slug));

  const outPath = path.join(OUT_PAGES, `${outName}.md`);
  writeMarkdown({
    outPath,
    title,
    description: description || firstParagraphText(body) || title,
    date,
    categories: [],
    tags: [],
    body,
    sidebar: false,
  });
  console.log(`page: ${outPath}`);
  return outPath;
}

fs.mkdirSync(OUT_BLOG, { recursive: true });
fs.mkdirSync(OUT_PAGES, { recursive: true });

const blogCount = importBlogArticles();

importStandalonePage({
  source: path.join(CONTENT_ROOT, 'speaking', 'Tech talks.html'),
  outName: 'speaking',
  titleOverride: 'Speaking',
  description: 'Conference talks, workshops, and community sessions by Martin Toshev.',
});

importStandalonePage({
  source: path.join(CONTENT_ROOT, 'training', 'Trainings.html'),
  outName: 'trainings',
  titleOverride: 'Trainings',
  description: 'Hands-on Java and platform trainings delivered by Martin Toshev.',
});

importStandalonePage({
  source: path.join(CONTENT_ROOT, 'books', 'Learning RabbitMQ book.html'),
  outName: 'books',
  titleOverride: 'Books',
  description: 'Books authored and co-authored by Martin Toshev.',
});

console.log(`Done. Imported ${blogCount} blog articles + standalone pages.`);
