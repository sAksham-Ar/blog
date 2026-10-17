import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

// Retain Zola's category feed addresses. Feed readers accept RSS at an .xml URL.
export async function getStaticPaths() {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  return [...new Set(posts.map(post => post.data.category))].map(category => ({
    params: { category: category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') },
    props: { category },
  }));
}

export async function GET({ props, site }: APIContext) {
  const posts = await getCollection('posts', ({ data }) => !data.draft && data.category === props.category);
  return rss({
    title: `${props.category} | Saksham Arya's Blog`,
    description: `Articles in ${props.category}`,
    site: site!,
    items: posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime()).map(post => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/posts/${post.id.replace(/\.mdx?$/, '')}/`,
    })),
  });
}
