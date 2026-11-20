import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';
import { createHash } from 'node:crypto';

const root = fileURLToPath(new URL('../', import.meta.url));
const items = JSON.parse(await readFile(path.join(root, 'src/data/library.json'), 'utf8'));
const wechatSources = JSON.parse(await readFile(path.join(root, 'src/data/wechat.sources.json'), 'utf8'));
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
// 使用通用身份标记，不把任何本人的身份底账写进测试源码。
const privateTerms = ['学校', '学院', '学号', '毕业', '在读', '在校', 'IP属地', '仅自己可见', 'college student', 'college junior', 'interning at'];
const origins = { xiaohongshu: 'www.xiaohongshu.com', x: 'x.com', bilibili: 'www.bilibili.com', wechat: 'mp.weixin.qq.com' };
const ids = new Set();
assert.equal(items.filter((item) => item.platform === 'wechat').length, wechatSources.articles.length, 'WeChat provenance list mismatch');
assert.ok(!/[?&](?:token|tempkey|key|ticket)=/i.test(JSON.stringify(wechatSources)), 'Login or preview parameters in public provenance');
const imageEvidence = new Map(wechatSources.images.map((image) => [image.file, image]));
const unescapeHTML = (text) => text.replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replace(/&#(?:39|x27);/g, "'");
assert.ok(items.length > 0, 'No verified content');
for (const item of items) {
	assert.match(item.id, /^[a-z0-9-]+$/, 'Unsafe content ID');
	assert.ok(!ids.has(item.id), `Duplicate ID: ${item.id}`);
	ids.add(item.id);
	assert.ok(['note', 'post', 'video', 'article'].includes(item.format), 'Unknown content format');
	const url = new URL(item.sourceUrl);
	assert.equal(url.protocol, 'https:');
	assert.equal(url.hostname, origins[item.platform], 'Unexpected source platform');
	assert.match(item.verifiedAt, /^\d{4}-\d{2}-\d{2}$/);
	if (item.publishedAt) assert.match(item.publishedAt, /^\d{4}-\d{2}-\d{2}$/);
	assert.ok(item.title && item.excerpt && item.sourceAuthor && item.bodyLabel, 'Missing attribution');
	assert.ok(Array.isArray(item.paragraphs) && item.paragraphs.length > 0, 'Missing source text');
	if (item.platform === 'wechat') {
		assert.equal(item.format, 'article');
		assert.equal(item.sourceAuthor, '禾冉 / 禾冉一起');
		assert.match(url.pathname, /^\/s\/[A-Za-z0-9_-]+$/);
		assert.equal(url.search, '', 'WeChat source must not contain session parameters');
		assert.ok(item.publishedAt && Array.isArray(item.blocks) && item.blocks.length > 0);
		assert.deepEqual(item.paragraphs, item.blocks.filter((block) => block.type !== 'image').map((block) => block.text), 'Article text snapshot does not match its blocks');
		const evidence = wechatSources.articles.find((entry) => entry.id === item.id);
		assert.ok(evidence?.original && evidence.account === '禾冉一起', 'Missing verified original source');
		assert.equal(evidence.sourceUrl, item.sourceUrl);
		assert.equal(evidence.publishedAt, item.publishedAt);
		assert.equal(sha256(item.paragraphs.join('').replace(/\s+/g, '')), evidence.normalizedTextSha256, `WeChat original text changed: ${item.id}`);
		assert.equal(item.blocks.filter((block) => block.type === 'image').length, evidence.includedBodyImageCount);
		if (evidence.originalBodyImageCount > evidence.includedBodyImageCount) assert.ok(item.contentNote?.includes('配图'), 'Missing omitted-image notice');
	}
	for (const block of item.blocks || []) {
		assert.ok(['paragraph', 'heading', 'quote', 'code', 'image'].includes(block.type), 'Unknown article block');
		if (block.type === 'image') {
			assert.match(block.src, /^\/content\/wechat\/[a-z0-9-]+\.(webp|jpg|png)$/);
			assert.ok((await stat(path.join(root, 'public', block.src))).isFile());
			assert.ok(block.width > 0 && block.height > 0 && block.alt);
			assert.ok(imageEvidence.has(block.src), 'Article body image has no reviewed source record');
		} else assert.ok(block.text?.trim(), 'Empty article block');
	}
	const text = JSON.stringify(item);
	assert.ok(!privateTerms.some((term) => text.includes(term)), `Private detail in ${item.id}`);
	if (item.cover) {
		assert.match(item.cover, /^\/content\/(?:wechat\/)?[a-z0-9-]+\.(webp|jpg|png)$/);
		assert.ok((await stat(path.join(root, 'public', item.cover))).isFile());
		if (item.platform === 'wechat') assert.ok(imageEvidence.has(item.cover), 'Article cover has no reviewed source record');
	}
	const html = await readFile(path.join(root, `dist/content/${item.id}/index.html`), 'utf8');
	assert.ok(unescapeHTML(html).includes(item.title), `Detail title missing: ${item.id}`);
	assert.ok(html.includes(item.bodyLabel), `Source type missing: ${item.id}`);
	assert.ok(html.includes('data-reader-body') && html.includes('<reader-preferences'), `Reader tools missing: ${item.id}`);
	assert.ok(html.includes('data-reader-pagination'), `Continue-reading navigation missing: ${item.id}`);
	assert.ok(unescapeHTML(html).includes(item.sourceUrl), `Source link missing: ${item.id}`);
	const body = html.match(/<div\b[^>]*data-reader-body[^>]*>([\s\S]*?)<\/section>/)?.[1];
	assert.ok(body, `Reading body missing: ${item.id}`);
	for (const paragraph of item.paragraphs) assert.ok(unescapeHTML(body).includes(paragraph), `Original paragraph changed: ${item.id}`);
	for (const block of item.blocks || []) {
		if (block.type === 'image') assert.ok(body.includes(block.src), `Article image missing: ${item.id}`);
	}
	if (item.platform === 'wechat') {
		assert.ok(html.includes('公众号文章原文'), `Article label missing: ${item.id}`);
		if (item.contentNote) assert.ok(html.includes(item.contentNote), `Omitted-image notice missing: ${item.id}`);
	}
	if (item.cover) assert.ok(html.includes('data-image-dialog') && html.includes('data-image-open'), `Image viewer missing: ${item.id}`);
}
for (const image of wechatSources.images) {
	assert.match(image.file, /^\/content\/wechat\/[a-z0-9-]+\.(webp|jpg|png)$/);
	assert.equal(new URL(image.sourceUrl).hostname, 'mmbiz.qpic.cn');
	assert.ok(image.visionChecked, 'Unreviewed article image');
	assert.equal(sha256(await readFile(path.join(root, 'public', image.file))), image.sha256, 'Article image changed');
	assert.ok(items.some((item) => item.cover === image.file || item.blocks?.some((block) => block.src === image.file)), 'Unused article image');
}
const index = await readFile(path.join(root, 'dist/content/index.html'), 'utf8');
for (const id of ids) assert.ok(index.includes(`/content/${id}/`), `Index link missing: ${id}`);
if (items.some((item) => item.platform === 'wechat')) {
	assert.ok(index.includes('data-filter="wechat"'), 'WeChat platform filter missing');
	assert.ok(!index.includes('公众号还没有整理进来'), 'Outdated WeChat copy is still visible');
}
for (const slug of ['best-ai-desktop-agents-2026', 'building-obsidian-ai-plugin-from-scratch']) {
	assert.ok(index.includes(`/blog/${slug}/`), `Old article missing: ${slug}`);
	const article = await readFile(path.join(root, `dist/blog/${slug}/index.html`), 'utf8');
	assert.ok(article.includes('data-reader-body') && article.includes('<reader-preferences'), `Old article reader missing: ${slug}`);
}

async function checkGenerated(dir) {
	let count = 0;
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const file = path.join(dir, entry.name);
		if (entry.isDirectory()) count += await checkGenerated(file);
		else if (/\.(html|xml|js)$/.test(entry.name)) {
			const text = await readFile(file, 'utf8');
			assert.ok(!privateTerms.some((term) => text.includes(term)), `Private detail in ${path.relative(root, file)}`);
			if (entry.name.endsWith('.html')) {
				assert.ok(text.includes('/social/avatar-soft-square.png?v=20261114-square'), `Avatar favicon missing in ${entry.name}`);
				assert.ok(!text.includes('href="/favicon.svg"'), 'Old H favicon is still linked');
			}
			count++;
		}
	}
	return count;
}
// 页签与站内头像统一为圆角方形；四角透明，但不能退化成圆形。
const avatar = sharp(path.join(root, 'public/social/avatar-soft-square.png'));
const avatarMeta = await avatar.metadata();
assert.ok(avatarMeta.hasAlpha, 'Rounded-square favicon must have alpha');
assert.equal(avatarMeta.width, avatarMeta.height, 'Favicon must have square dimensions');
const { data: avatarPixels, info: avatarInfo } = await avatar.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
for (const [x, y] of [[0, 0], [avatarInfo.width - 1, 0], [0, avatarInfo.height - 1], [avatarInfo.width - 1, avatarInfo.height - 1]]) {
	assert.equal(avatarPixels[(y * avatarInfo.width + x) * 4 + 3], 0, 'Favicon corner must be transparent');
}
const alphaAt = (x, y) => avatarPixels[(y * avatarInfo.width + x) * 4 + 3];
assert.equal(alphaAt(Math.floor(avatarInfo.width / 2), 0), 255, 'Top edge must be opaque');
assert.equal(alphaAt(Math.floor(avatarInfo.width / 12), Math.floor(avatarInfo.height / 12)), 255, 'Rounded square must retain more of its corners than a circle');
const originalPixels = await sharp(path.join(root, 'public/social/xiaohongshu-avatar.webp')).ensureAlpha().raw().toBuffer();
for (let i = 0; i < avatarPixels.length; i += 4) {
	for (let c = 0; c < 3; c++) assert.equal(avatarPixels[i + c], originalPixels[i + c], 'Avatar RGB must stay unchanged');
}
const avatarCSS = await readFile(path.join(root, 'src/components/AccountCards.astro'), 'utf8');
assert.ok(avatarCSS.includes('border-radius: var(--avatar-radius)'), 'Account avatars must use shared rounding');
const globalCSS = await readFile(path.join(root, 'src/styles/global.css'), 'utf8');
assert.ok(globalCSS.includes('--avatar-radius: 16.6667%'), 'Avatar rounding must match favicon');
const homeHTML = await readFile(path.join(root, 'dist/index.html'), 'utf8');
const home = homeHTML.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1];
assert.ok(home, 'Homepage main missing');
// 2026-11-18 新职责：首页是交互入口，内容陈列在 /content/，不再要求首页复制所有条目。
assert.ok(home.includes('data-home-portal') && home.includes('data-portal-desk'), 'Interactive paper portal missing');
assert.equal((home.match(/<article\b[^>]*\bdata-portal-sheet\b/g) || []).length, 4, 'Homepage needs four destination papers, not an article feed');
assert.ok(!/<details\b[^>]*\bdata-portal/.test(home), 'Primary paper must not be hidden behind a disclosure');
const firstPaperTag = home.match(/<article\b[^>]*\bdata-portal-sheet\b[^>]*>/)?.[0];
assert.ok(firstPaperTag && !/\b(?:hidden|inert)\b/.test(firstPaperTag), 'First destination must be usable without JavaScript');
for (const href of ['/content/', '/work/', '/about/', '/about/#contact']) assert.ok(home.includes(`href="${href}"`), `Portal destination missing: ${href}`);
assert.ok(home.includes('<noscript>') && home.includes('portal-fallback'), 'No-JS destination links missing');
const picks = [...home.matchAll(/<a\b(?=[^>]*\bdata-home-pick\b)[^>]*>[\s\S]*?<\/a>/g)];
assert.equal(picks.length, 1, 'Allow one selected case, not a homepage feed');
const pick = picks[0][0];
const pickId = pick.match(/\bhref="\/content\/([^"/]+)\/"/)?.[1];
const pickedItem = items.find((item) => item.id === pickId);
assert.ok(pickedItem?.cover && pick.includes(`src="${pickedItem.cover}"`), 'Homepage pick must reuse a verified entry and its public cover');
const homeWithoutPick = home.replace(pick, '');
for (const id of ids) assert.ok(!homeWithoutPick.includes(`/content/${id}/`), `Article listing leaked back onto homepage: ${id}`);
assert.ok(!home.includes('data-home-reading') && !home.includes('data-video-shelf'), 'Content shelves must stay on inner pages');
assert.ok((homeWithoutPick.match(/<img\b/g) || []).length <= 1, 'No extra gallery images beside the desk pick');
assert.ok(!home.includes('截图待补') && !home.includes('照片待补'), 'Placeholder images must not lead the homepage');
const checked = await checkGenerated(path.join(root, 'dist'));
console.log(`PASS: simple four-destination paper portal and no-JS links; all content remains on inner pages with original paragraphs, reader tools and image viewer; ${items.length} verified entries, ${ids.size} detail pages, old article URLs, consistent rounded-square avatars and favicon; ${checked} generated files scanned for identifying details.`);
