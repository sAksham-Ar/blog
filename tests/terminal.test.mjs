import test from 'node:test';
import assert from 'node:assert/strict';
import { createTerminal, resolvePath, tokenize, HOME } from '../src/lib/terminal.mjs';
const posts = [
  { slug: 'nan-golang', title: 'NaN in Golang', date: '2025-12-28', category: 'golang', body: 'A real article.\n\n```go\nvar a = 1\n```' },
  { slug: 'rabbitmq', title: 'Keeping services in sync', date: '2022-03-25', category: 'RabbitMQ', series: 'Cloud & Microservices', body: '<script>alert(1)</script>' },
  { slug: 'c++', title: 'C++ pointers', date: '2020-07-01', category: 'C++', series: 'C++ Fundamentals', body: 'Pointers.' },
];
const text = result => result.lines.map(line => line.text).join('\n');
test('normalizes home, relative, parent and absolute paths without escaping root', () => {
  assert.equal(resolvePath('~/posts/../about.txt'), HOME + '/about.txt');
  assert.equal(resolvePath('../../../../'), '/');
  assert.equal(resolvePath('../topics', HOME + '/posts'), HOME + '/topics');
});
test('handles quoted arguments, escaped spaces and literal shell-looking input', () => {
  assert.deepEqual(tokenize('find ~ -iname "*GO*"'), ['find', '~', '-iname', '*GO*']);
  assert.deepEqual(tokenize("echo 'a b' c\\ d"), ['echo', 'a b', 'c d']);
  assert.throws(() => tokenize("cat 'missing"));
  assert.match(text(createTerminal(posts).execute('echo <script>alert(1)</script>')), /<script>/);
});
test('navigates directories, lists only children and returns to previous cwd', () => {
  const shell = createTerminal(posts);
  assert.match(text(shell.execute('ls')), /posts\//);
  assert.doesNotMatch(text(shell.execute('ls')), /nan-golang/);
  shell.execute('cd posts');
  assert.equal(text(shell.execute('pwd')), HOME + '/posts');
  assert.match(text(shell.execute('ls -al')), /-r--r--r--.*nan-golang.md/);
  shell.execute('cd -');
  assert.equal(shell.cwd, HOME);
  assert.match(text(shell.execute('ls /')), /home\//);
});
test('reads full actual post content and links to the formatted article', () => {
  const shell = createTerminal(posts);
  const result = shell.execute('cat posts/nan-golang.md');
  assert.match(text(result), /var a = 1/);
  assert.equal(result.lines.at(-1).url, '/posts/nan-golang');
  assert.equal(shell.execute('open posts/nan-golang.md').url, '/posts/nan-golang');
  assert.match(text(shell.execute('cat posts/rabbitmq.md')), /<script>alert/);
  assert.match(text(shell.execute('cat README.md about.txt')), /Engineer\. Runner/);
});
test('find supports case, glob names, literal regex characters and type filters', () => {
  const shell = createTerminal(posts);
  assert.match(text(shell.execute('find posts -iname "*GOLANG*"')), /nan-golang.md/);
  assert.equal(text(shell.execute('find posts -name "*GOLANG*"')), '(no matches)');
  assert.match(text(shell.execute('find posts -name "c++.md"')), /c\+\+.md/);
  assert.match(text(shell.execute('find series -type d')), /series\/cpp\//);
  assert.doesNotMatch(text(shell.execute('find topics -type d')), /\.md/);
  assert.match(text(shell.execute('find topics -name "rabbit??.md"')), /rabbitmq.md/);
});
test('reports invalid paths and flags while preserving cwd', () => {
  const shell = createTerminal(posts);
  for (const command of ['cd nowhere', 'cd about.txt', 'cat posts', 'cat missing', 'find ~ -name', 'find ~ -type x', 'ls -z', "cat '", 'sudo reboot']) {
    assert.ok(shell.execute(command).lines[0].error, command);
    assert.equal(shell.cwd, HOME);
  }
});
test('completion handles commands, directories, home paths and article filenames', () => {
  const shell = createTerminal(posts);
  assert.equal(shell.complete('pw').value, 'pwd ');
  assert.equal(shell.complete('cd po').value, 'cd posts/');
  assert.equal(shell.complete('cat ~/posts/nan').value, 'cat ~/posts/nan-golang.md ');
  shell.execute('cd posts');
  assert.equal(shell.complete('cat rabb').value, 'cat rabbitmq.md ');
  assert.ok(shell.complete('cat ').matches.length === 3);
});
test('listed file commands remain executable and clear/exit are explicit actions', () => {
  const shell = createTerminal(posts);
  const file = shell.execute('ls posts').lines.find(line => line.text === 'nan-golang.md');
  assert.match(text(shell.execute(file.command)), /NaN in Golang/);
  assert.equal(shell.execute('clear').clear, true);
  assert.equal(shell.execute('exit').url, '/');
});
