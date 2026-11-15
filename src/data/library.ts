import libraryData from './library.json';

export type ArticleBlock =
	| { type: 'paragraph' | 'heading' | 'quote' | 'code'; text: string }
	| { type: 'image'; src: string; alt: string; width?: number; height?: number };

export interface LibraryItem {
	id: string;
	title: string;
	platform: 'xiaohongshu' | 'x' | 'bilibili' | 'wechat';
	format: 'note' | 'post' | 'video' | 'article';
	topic: string;
	excerpt: string;
	sourceUrl: string;
	sourceAuthor: string;
	verifiedAt: string;
	publishedAt?: string;
	cover?: string;
	coverWidth?: number;
	coverHeight?: number;
	paragraphs?: string[];
	blocks?: ArticleBlock[];
	bodyLabel?: string;
	contentNote?: string;
	featured?: boolean;
}

// JSON 由内容采集维护；id 同时作为 /content/[slug]/ 的稳定路径。
// 未提供 publishedAt 的条目不推断发布日期，verifiedAt 仅用于核对日期。
export const library: readonly LibraryItem[] = libraryData as LibraryItem[];

export const platformLabels: Record<LibraryItem['platform'], string> = {
	xiaohongshu: '小红书',
	x: 'X',
	bilibili: 'B 站',
	wechat: '公众号',
};

export const libraryFormats: Record<LibraryItem['format'], string> = {
	note: '笔记',
	post: '帖子',
	video: '视频',
	article: '文章',
};
