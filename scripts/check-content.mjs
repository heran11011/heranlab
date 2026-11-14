import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../', import.meta.url));
const items = JSON.parse(await readFile(path.join(root, 'src/data/library.json'), 'utf8'));
// 使用通用身份标记，不把任何本人的身份底账写进测试源码。
const privateTerms = ['学校', '学院', '学号', '毕业', '在读', '在校', 'IP属地', '仅自己可见', 'college student', 'college junior', 'interning at'];
const origins = { xiaohongshu: 'www.xiaohongshu.com', x: 'x.com', bilibili: 'www.bilibili.com' };
const ids = new Set();
assert.ok(items.length > 0, 'No verified content');
for (const item of items) {
	assert.match(item.id, /^[a-z0-9-]+$/, 'Unsafe content ID');
	assert.ok(!ids.has(item.id), `Duplicate ID: ${item.id}`);
	ids.add(item.id);
	assert.ok(['note', 'post', 'video'].includes(item.format), 'Unknown content format');
	const url = new URL(item.sourceUrl);
	assert.equal(url.protocol, 'https:');
	assert.equal(url.hostname, origins[item.platform], 'Unexpected source platform');
	assert.match(item.verifiedAt, /^\d{4}-\d{2}-\d{2}$/);
	if (item.publishedAt) assert.match(item.publishedAt, /^\d{4}-\d{2}-\d{2}$/);
	assert.ok(item.title && item.excerpt && item.sourceAuthor && item.bodyLabel, 'Missing attribution');
	assert.ok(Array.isArray(item.paragraphs) && item.paragraphs.length > 0, 'Missing source text');
	const text = JSON.stringify(item);
	assert.ok(!privateTerms.some((term) => text.includes(term)), `Private detail in ${item.id}`);
	if (item.cover) {
		assert.match(item.cover, /^\/content\/[a-z0-9-]+\.(webp|jpg)$/);
		assert.ok((await stat(path.join(root, 'public', item.cover))).isFile());
	}
	const html = await readFile(path.join(root, `dist/content/${item.id}/index.html`), 'utf8');
	assert.ok(html.includes(item.title), `Detail title missing: ${item.id}`);
	assert.ok(html.includes(item.bodyLabel), `Source type missing: ${item.id}`);
}
const index = await readFile(path.join(root, 'dist/content/index.html'), 'utf8');
for (const id of ids) assert.ok(index.includes(`/content/${id}/`), `Index link missing: ${id}`);
for (const slug of ['best-ai-desktop-agents-2026', 'building-obsidian-ai-plugin-from-scratch']) {
	assert.ok(index.includes(`/blog/${slug}/`), `Old article missing: ${slug}`);
	await stat(path.join(root, `dist/blog/${slug}/index.html`));
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
assert.ok(home.includes('/content/dawdex-adventurex/'), 'Lead content missing on homepage');
assert.ok(home.includes('/content/dawdex-video/'), 'Video content missing on homepage');
assert.ok(home.includes('/content/early-video-regret/'), 'Second video missing on homepage');
assert.ok((home.match(/<img\b/g) || []).length >= 5, 'Homepage has lost its image-led layout');
assert.ok(!home.includes('截图待补') && !home.includes('照片待补'), 'Placeholder images must not lead the homepage');
const checked = await checkGenerated(path.join(root, 'dist'));
console.log(`PASS: image-led homepage and video links; ${items.length} verified entries, ${ids.size} detail pages, old article URLs, consistent rounded-square avatars and favicon; ${checked} generated files scanned for identifying details.`);
