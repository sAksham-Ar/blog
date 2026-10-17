import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';
import redirects from '../src/data/legacy-redirects.json' with { type: 'json' };

const files = directory => readdirSync(directory).flatMap(name => {
  const path = join(directory, name);
  return statSync(path).isDirectory() ? files(path) : [path];
});
function destination(url) {
  const path = join('dist', decodeURIComponent(url.pathname));
  if (existsSync(path) && statSync(path).isFile()) return path;
  return join(path, 'index.html');
}

test('all generated internal navigation, assets, and fragments resolve', () => {
  const errors = [];
  const documents = new Map();
  for (const file of files('dist').filter(path => path.endsWith('.html'))) {
    const dom = new JSDOM(readFileSync(file, 'utf8'));
    documents.set(file, dom);
  }
  for (const [file, dom] of documents) {
    const pathname = '/' + file.replace(/^dist\//, '').replace(/index\.html$/, '');
    for (const element of dom.window.document.querySelectorAll('[href], [src]')) {
      const ref = element.getAttribute('href') ?? element.getAttribute('src');
      const url = new URL(ref, 'https://sakshamar.in' + pathname);
      if (url.origin !== 'https://sakshamar.in') continue;
      const target = destination(url);
      if (!existsSync(target)) errors.push(`${file}: ${ref}`);
      else if (url.hash && documents.has(target) && !documents.get(target).window.document.getElementById(decodeURIComponent(url.hash.slice(1)))) errors.push(`${file}: missing fragment ${ref}`);
    }
  }
  for (const dom of documents.values()) dom.window.close();
  assert.deepEqual(errors, []);
});

test('RSS article links resolve and contain all 26 migrated posts', () => {
  const dom = new JSDOM(readFileSync('dist/rss.xml', 'utf8'), { contentType: 'text/xml' });
  const links = [...dom.window.document.querySelectorAll('item > link')];
  assert.equal(links.length, 26);
  for (const link of links) assert.ok(existsSync(destination(new URL(link.textContent))), link.textContent);
  dom.window.close();
});

test('every original post URL resolves; compatibility pages have correct destinations', () => {
  for (const file of readdirSync('content/posts').filter(file => file !== '_index.md')) {
    const oldSlug = file.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    assert.ok(existsSync(destination(new URL(`/posts/${oldSlug}/`, 'https://sakshamar.in'))), file);
  }
  for (const [from, to] of Object.entries(redirects)) {
    const dom = new JSDOM(readFileSync(destination(new URL(from, 'https://sakshamar.in')), 'utf8'));
    assert.ok(dom.window.document.querySelector('meta[http-equiv="refresh"]').content.endsWith(`url=${to}`), from);
    assert.ok(existsSync(destination(new URL(to, 'https://sakshamar.in'))), to);
    dom.window.close();
  }
});

test('legacy category feeds retain their article sets and working links', () => {
  const counts = { c: 20, python: 2, docker: 1, golang: 1, kubernetes: 1, rabbitmq: 1 };
  for (const [category, count] of Object.entries(counts)) {
    const dom = new JSDOM(readFileSync(`dist/categories/${category}/atom.xml`, 'utf8'), { contentType: 'text/xml' });
    const links = [...dom.window.document.querySelectorAll('item > link')];
    assert.equal(links.length, count, category);
    for (const link of links) assert.ok(existsSync(destination(new URL(link.textContent))), link.textContent);
    dom.window.close();
  }
});
