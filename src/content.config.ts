import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
		}),
});

// 作品。正文写“做了什么”，一条一件事、只写事和结果
const work = defineCollection({
	loader: glob({ base: './src/content/work', pattern: '**/*.md' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			titleLang: z.enum(['en', 'zh']).default('zh'), // 决定标题用英文衬线还是中文宋体
			summary: z.string(), // 卡片和详情页导语用的一句话
			group: z.enum(['tools', 'hardware', 'growth']),
			kind: z.string(), // 卡片上的类型标签，如“工具”“硬件 · 毕设”
			period: z.string(), // 卡片上的时间，如“2026.06”
			order: z.number(),
			featured: z.boolean().default(false), // 是否上首页
			wide: z.boolean().default(false), // 首页是否横跨两列
			meta: z.array(z.object({ k: z.string(), v: z.string(), todo: z.string().optional() })),
			cover: image().optional(),
			coverTodo: z.string().default('截图待补'),
			shots: z.array(z.object({ src: image().optional(), caption: z.string() })).default([]),
			command: z.object({ text: z.string(), todo: z.string().optional() }).optional(),
			links: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
			titleTodo: z.string().optional(),
			bodyTodo: z.string().optional(),
			// 不渲染。每个数字指回哪里，给自己核对用；有数字没 sources，构建会警告
			sources: z.array(z.string()).default([]),
		}),
});

export const collections = { blog, work };
