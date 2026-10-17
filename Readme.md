# Blog

Saksham Arya's technical blog at <https://sakshamar.in>, built with Astro, MDX and Tailwind CSS. Article sources are in `src/content/posts`; static files are in `public`. Search matches article titles, descriptions, categories and series (not full article bodies).

## Local development and checks

Use Node.js 24 and npm:

```sh
npm ci
npm run dev
```

Before submitting changes:

```sh
npm run check
npm run build
npm test
npm run preview
```

Tests inspect the built `dist` output, so build first. They cover safe search rendering, keyboard focus and dismissal, internal links/assets/fragments, RSS destinations and legacy URLs. Browser smoke checks should also cover Tab/Shift+Tab, Escape, Ctrl/Cmd+K and focus restoration. Search uses a labelled modal dialog, makes background content inert, and announces result counts.

## Publishing

`.github/workflows/deploy.yml` is the only publishing workflow. Pull requests targeting `main` run install, type checks, build and tests with read-only repository permissions. A push to `main` runs the same checks, then uploads the static Pages artifact and deploys it with permissions scoped to the deploy job. Configure the repository's Pages source as **GitHub Actions**. This setting must be checked by the maintainer before publishing; local builds do not deploy. The former Zola publishing workflow has been removed.

## Zola migration and URL compatibility

The original `content`, `config.toml`, `static` and theme references are retained for migration history; they are not Astro's publishing inputs. Do not edit them to publish new content.

`src/data/legacy-redirects.json` records the compatibility routes derived from the original filenames and config. Zola's default [dated-filename handling](https://www.getzola.org/documentation/content/page/) strips date prefixes; Astro's content IDs retain them. All 23 dated article URLs redirect to the existing Astro articles. The other three article paths are unchanged. Zola's `/categories/c/` redirects to `/categories/c++/`. Old `/posts/page/1/` through `/posts/page/6/` and category pagination addresses lead to the corresponding complete listing. Pagination boundaries intentionally no longer apply.

Astro emits static HTML refresh redirects with canonical destinations and fallback links, suitable for GitHub Pages; these are not server-side HTTP 301 responses. Slashless directory addresses rely on the static host's normal directory redirect. All original category `atom.xml` addresses remain available as valid RSS feeds; the site-wide feed is `/rss.xml`. The original config did not enable a site-wide Atom feed. Original articles have no tag taxonomy assignments, so no tag listing or tag feed compatibility pages are added. Historic heading fragments may differ with the Markdown renderer; only current generated fragments are checked. Unknown routes use the existing 404 page.

No article text or visual redesign is part of the migration finish. The Kubernetes article's legacy Zola link syntax is updated to its existing RabbitMQ article, and RSS uses Astro content IDs for working article URLs.
