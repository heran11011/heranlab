import { getCollection } from 'astro:content';

export const GROUPS = {
	tools: '自己做的工具',
	hardware: '硬件与物联网',
	growth: '增长与运营',
} as const;

export async function getWorks() {
	return (await getCollection('work')).sort((a, b) => a.data.order - b.data.order);
}
