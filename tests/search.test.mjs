import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';

function setup(transform = script => script) {
  const dom = new JSDOM(readFileSync('dist/index.html', 'utf8'), { url: 'https://sakshamar.in', runScripts: 'outside-only' });
  const { window } = dom;
  const { document } = window;
  const script = [...document.scripts].find(script => script.textContent.includes('function openSearch'));
  assert.ok(script, 'built search script exists');
  window.eval(transform(script.textContent));
  const input = document.getElementById('search-input');
  const trigger = document.getElementById('search-btn');
  trigger.focus();
  trigger.click();
  const key = (key, options = {}) => window.dispatchEvent(new window.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...options }));
  const query = value => { input.value = value; input.dispatchEvent(new window.Event('input', { bubbles: true })); };
  return { dom, window, document, input, trigger, key, query };
}

test('hostile queries stay literal text; search still finds articles and clears', () => {
  const { dom, document, query } = setup();
  const results = document.getElementById('search-results');
  for (const value of ['<img src=x onerror="alert(1)">', '<svg onload=alert(1)>', '\"><a href="javascript:alert(1)">click</a>']) {
    query(value);
    assert.ok(results.textContent.includes(value));
    assert.equal(results.querySelector('img,svg,a,script'), null);
  }
  query('docker');
  assert.ok(results.querySelector('a[href="/posts/2021-09-29-introduction-to-docker/"]'));
  assert.match(document.getElementById('search-status').textContent, /articles found/);
  query('  ');
  assert.equal(results.querySelector('a'), null);
  assert.match(results.textContent, /Type to search/);
  dom.window.close();
});

test('dialog traps both tab directions, guards focus, escapes and restores opener', () => {
  const { dom, document, input, trigger, key, query } = setup();
  const modal = document.getElementById('search-modal');
  assert.equal(modal.getAttribute('role'), 'dialog');
  assert.equal(modal.getAttribute('aria-modal'), 'true');
  assert.equal(document.activeElement, input);
  assert.equal(document.querySelector('main').inert, true);
  key('Tab', { shiftKey: true });
  assert.equal(document.activeElement.id, 'close-search-btn');
  key('Tab');
  assert.equal(document.activeElement, input);
  query('docker');
  const links = [...modal.querySelectorAll('a')];
  input.focus();
  key('Tab', { shiftKey: true });
  assert.equal(document.activeElement, links.at(-1));
  key('Tab');
  assert.equal(document.activeElement, input);
  trigger.focus();
  assert.equal(document.activeElement, input);
  input.click();
  assert.equal(modal.classList.contains('hidden'), false);
  key('Escape');
  assert.equal(modal.classList.contains('hidden'), true);
  assert.equal(document.activeElement, trigger);
  assert.notEqual(document.querySelector('main').inert, true);
  const other = document.getElementById('theme-toggle');
  other.focus();
  key('k', { ctrlKey: true });
  assert.equal(document.activeElement, input);
  key('k', { metaKey: true });
  assert.equal(document.activeElement, other);
  trigger.click();
  document.getElementById('close-search-btn').click();
  assert.ok(modal.classList.contains('hidden'));
  trigger.click();
  modal.click();
  assert.ok(modal.classList.contains('hidden'));
  dom.window.close();
});


test('article metadata renders as text, including markup-like titles', () => {
  const title = '<img src=x onerror="alert(1)">';
  const { dom, document, query } = setup(script => script.replace(/"title":"(?:[^"\\]|\\.)*"/, '"title":' + JSON.stringify(title)));
  query('<img');
  const results = document.getElementById('search-results');
  assert.equal(results.querySelector('h4')?.textContent, title);
  assert.equal(results.querySelector('img'), null);
  dom.window.close();
});
