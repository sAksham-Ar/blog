export const HOME = '/home/saksham';
const commands = ['help', 'ls', 'cd', 'pwd', 'cat', 'find', 'open', 'whoami', 'echo', 'clear', 'exit'];
const quote = value => `'${value.replaceAll("'", "'\\''")}'`;

export function tokenize(input) {
  const tokens = [];
  let word = '', delimiter = '', escaped = false, started = false;
  for (const char of input) {
    if (escaped) { word += char; escaped = false; started = true; }
    else if (char === '\\' && delimiter !== "'") { escaped = true; started = true; }
    else if (delimiter) { if (char === delimiter) delimiter = ''; else word += char; }
    else if (char === '"' || char === "'") { delimiter = char; started = true; }
    else if (/\s/.test(char)) { if (started) tokens.push(word); word = ''; started = false; }
    else { word += char; started = true; }
  }
  if (delimiter || escaped) throw new Error('Unclosed quote or unfinished escape.');
  if (started) tokens.push(word);
  return tokens;
}

export function resolvePath(path, cwd = HOME) {
  if (path === '~' || path.startsWith('~/')) path = HOME + path.slice(1);
  const pieces = (path.startsWith('/') ? path : `${cwd}/${path}`).split('/');
  const normalized = [];
  for (const part of pieces) {
    if (!part || part === '.') continue;
    if (part === '..') normalized.pop(); else normalized.push(part);
  }
  return '/' + normalized.join('/');
}

export function createTerminal(posts) {
  const nodes = new Map();
  let cwd = HOME, previousCwd = HOME;
  function directory(path) {
    if (nodes.has(path)) return;
    if (path !== '/') directory(path.slice(0, path.lastIndexOf('/')) || '/');
    nodes.set(path, { type: 'd' });
  }
  function file(path, text, url) {
    directory(path.slice(0, path.lastIndexOf('/')));
    nodes.set(path, { type: 'f', text, url });
  }
  directory(`${HOME}/posts`);
  directory(`${HOME}/topics`);
  directory(`${HOME}/series`);
  file(`${HOME}/about.txt`, 'Saksham Arya\nEngineer. Runner. Tinkerer.\n\nGo, C++, Python, distributed systems, and infrastructure.\nGitHub: https://github.com/sAksham-Ar\n', '/');
  file(`${HOME}/README.md`, '# Welcome to ~/saksham\n\nExplore engineering notes with familiar commands.\n\nls posts/\ncd posts\ncat <filename.md>\nfind ~ -iname "*golang*"\nfind ~/topics -type d\n\nTab completes paths. ↑ / ↓ recalls commands. Ctrl+L clears.\nUse open <file> to read the formatted article, or exit to return to the site.\n');
  for (const post of posts) {
    const slug = post.slug;
    const filename = `${slug}.md`;
    const text = `# ${post.title}\n\n${post.date} · ${post.category}\n\n${post.body || post.description || ''}`;
    const url = `/posts/${slug}`;
    file(`${HOME}/posts/${filename}`, text, url);
    file(`${HOME}/topics/${post.category.toLowerCase()}/${filename}`, text, url);
    if (post.series) file(`${HOME}/series/${post.series.toLowerCase().includes('c++') ? 'cpp' : 'cloud'}/${filename}`, text, url);
  }
  const children = path => [...nodes.entries()].filter(([key]) => key !== path && (key.slice(0, key.lastIndexOf('/')) || '/') === path).sort(([a], [b]) => a.localeCompare(b));
  const display = path => path === HOME ? '~' : path.startsWith(`${HOME}/`) ? '~' + path.slice(HOME.length) : path;
  const fail = text => ({ lines: [{ text, error: true }] });
  const entry = (path, node, label = path.split('/').pop()) => ({
    text: label + (node.type === 'd' ? '/' : ''),
    command: `${node.type === 'd' ? 'cd' : 'cat'} ${quote(path)}`,
    directory: node.type === 'd',
  });
  function execute(input) {
    let tokens;
    try { tokens = tokenize(input); } catch (error) { return fail(error.message); }
    if (!tokens.length) return { lines: [] };
    const [command, ...args] = tokens;
    if (command === 'help') return { lines: [{ text: 'ls [-al] [path]              list files and folders\ncd [path] / cd -             change directory / go back\npwd                         show your current directory\ncat <file> [...]            read articles in the terminal\nfind [path] [-name pattern]  find files; also -iname, -type f|d\nopen <file>                 read a formatted article\nwhoami                      about Saksham\necho <text>                 print text\nclear                       clear the screen\nexit                        return to the regular site\n\nQuote patterns: find ~ -iname "*docker*"\nTab: complete a path · ↑/↓: history · Ctrl+L: clear' }] };
    if (command === 'clear') return { lines: [], clear: true };
    if (command === 'exit') return { lines: [], url: '/' };
    if (command === 'pwd') return { lines: [{ text: cwd }] };
    if (command === 'whoami') return { lines: [{ text: nodes.get(`${HOME}/about.txt`).text }] };
    if (command === 'echo') return { lines: [{ text: args.join(' ') }] };
    if (command === 'cd') {
      if (args.length > 1) return fail('cd: too many arguments');
      const path = args[0] === '-' ? previousCwd : resolvePath(args[0] ?? '~', cwd);
      const node = nodes.get(path);
      if (!node) return fail(`cd: ${args[0]}: no such directory`);
      if (node.type !== 'd') return fail(`cd: ${args[0]}: not a directory`);
      previousCwd = cwd; cwd = path;
      return { lines: args[0] === '-' ? [{ text: display(cwd) }] : [] };
    }
    if (command === 'ls') {
      const options = args.filter(arg => arg.startsWith('-'));
      if (options.some(arg => !/^-[alh]+$/.test(arg))) return fail('ls: supported options are -a, -l, and -h');
      const long = options.some(arg => arg.includes('l'));
      const paths = args.filter(arg => !arg.startsWith('-'));
      const lines = [];
      for (const arg of paths.length ? paths : ['.']) {
        const path = resolvePath(arg, cwd), node = nodes.get(path);
        if (!node) { lines.push({ text: `ls: ${arg}: no such file or directory`, error: true }); continue; }
        if (paths.length > 1) lines.push({ text: `${display(path)}:` });
        if (node.type === 'd' && options.some(option => option.includes('a'))) {
          lines.push(entry(path, node, '.'));
          lines.push(entry(resolvePath('..', path), { type: 'd' }, '..'));
        }
        for (const [key, item] of node.type === 'd' ? children(path) : [[path, node]]) {
          const line = entry(key, item);
          if (long) line.text = `${item.type === 'd' ? 'dr-xr-xr-x' : '-r--r--r--'}  saksham  ${line.text}`;
          lines.push(line);
        }
      }
      return { lines };
    }
    if (command === 'cat' || command === 'open') {
      if (!args.length) return fail(`${command}: specify a file (try ls posts/)`);
      if (command === 'open' && args.length !== 1) return fail('open: specify one file');
      const lines = [];
      for (const arg of args) {
        const path = resolvePath(arg, cwd), node = nodes.get(path);
        if (!node) lines.push({ text: `${command}: ${arg}: no such file`, error: true });
        else if (node.type === 'd') lines.push({ text: `${command}: ${arg}: is a directory`, error: true });
        else if (command === 'open') return node.url ? { lines: [], url: node.url } : fail('open: use cat to read this file');
        else {
          lines.push({ text: node.text });
          if (node.url) lines.push({ text: 'Read formatted article ↗', url: node.url });
        }
      }
      return { lines };
    }
    if (command === 'find') {
      const remaining = [...args];
      const start = resolvePath(remaining[0] && !remaining[0].startsWith('-') ? remaining.shift() : '.', cwd);
      if (!nodes.has(start)) return fail(`find: ${display(start)}: no such file or directory`);
      let name, type, insensitive = false;
      while (remaining.length) {
        const flag = remaining.shift(), value = remaining.shift();
        if (!value) return fail(`find: missing argument after ${flag}`);
        if (flag === '-name' || flag === '-iname') { name = value; insensitive = flag === '-iname'; }
        else if (flag === '-type' && ['f', 'd'].includes(value)) type = value;
        else return fail('find: use -name <pattern>, -iname <pattern>, or -type f|d');
      }
      const pattern = name === undefined ? null : new RegExp('^' + name.split('').map(char => char === '*' ? '.*' : char === '?' ? '.' : char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('') + '$', insensitive ? 'i' : '');
      const lines = [...nodes.entries()].filter(([path, node]) => (path === start || path.startsWith(start === '/' ? '/' : start + '/')) && (!type || type === node.type) && (!pattern || pattern.test(path.split('/').pop()))).sort(([a], [b]) => a.localeCompare(b)).map(([path, node]) => entry(path, node, display(path)));
      return { lines: lines.length ? lines : [{ text: '(no matches)' }] };
    }
    return fail(`${command}: command not found. Type help for available commands.`);
  }
  function complete(input) {
    // Complete the last unquoted argument; quoted paths still work when submitted.
    if (/["'\\]/.test(input)) return { value: input, matches: [] };
    const index = input.lastIndexOf(' ') + 1, fragment = input.slice(index), prefix = input.slice(0, index);
    if (!prefix) {
      const matches = commands.filter(command => command.startsWith(fragment));
      return { value: matches.length === 1 ? matches[0] + ' ' : input, matches };
    }
    const slash = fragment.lastIndexOf('/'), parent = fragment.slice(0, slash + 1), name = fragment.slice(slash + 1);
    const directoryPath = resolvePath(parent || '.', cwd);
    const matches = children(directoryPath).filter(([path]) => path.split('/').pop().startsWith(name)).map(([path, node]) => parent + path.split('/').pop() + (node.type === 'd' ? '/' : ''));
    let shared = matches[0] || fragment;
    for (const match of matches) while (!match.startsWith(shared)) shared = shared.slice(0, -1);
    return { value: prefix + shared + (matches.length === 1 && !shared.endsWith('/') ? ' ' : ''), matches };
  }
  return { execute, complete, get cwd() { return cwd; }, get prompt() { return `root@saksham:${display(cwd)}$`; } };
}
