import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context: any) {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  posts.sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());

  return rss({
    title: "Saksham Arya's Blog",
    description: 'Personal technical blog by Saksham Arya on Go, Docker, Kubernetes, C++, Python, and Software Systems.',
    site: context.site || 'https://sakshamar.in',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: new Date(post.data.date),
      description: post.data.description || '',
      link: `/posts/${post.id.replace(/\.mdx?$/, '')}/`,
    })),

    customData: `<language>en-us</language>`,
  });
}
