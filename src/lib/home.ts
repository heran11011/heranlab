import type { LibraryItem } from '../data/library';

export const homeTopics = ['全部', 'AI 使用', '自己做的', '日常'] as const;
export type HomeTopic = (typeof homeTopics)[number];

// 只归类已有主题，不改动采集数据，也不把核对日期当发布日期。
export function homeTopic(item: LibraryItem): Exclude<HomeTopic, '全部'> {
	if (['AI 使用技巧', '自动化实测'].includes(item.topic)) return 'AI 使用';
	if (['自己做的项目', '创作过程'].includes(item.topic)) return '自己做的';
	return '日常';
}

const coverSizes: Record<string, readonly [number, number]> = {
	'/content/dawdex-adventurex.webp': [1438, 1080],
	'/content/deepseek-roleplay.webp': [1080, 1440],
	'/content/mac-autofill.webp': [828, 590],
	'/content/meme-art-origin.webp': [1080, 1438],
	'/content/dawdex-video.jpg': [1920, 1080],
	'/content/early-video-regret.jpg': [1728, 1080],
};

// 视频图片明确按已核验的条目 + 路径放行；小红书视频始终只展示简介。
const safeVideoCovers: Record<string, string> = {
	'dawdex-video': '/content/dawdex-video.jpg',
	'early-video-regret': '/content/early-video-regret.jpg',
};

export function homeCover(item: LibraryItem) {
	if (!item.cover || (item.format === 'video' && safeVideoCovers[item.id] !== item.cover)) return undefined;
	const size = coverSizes[item.cover];
	if (!size) return undefined;
	return { src: item.cover, width: size[0], height: size[1] };
}
