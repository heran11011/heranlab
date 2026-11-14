import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

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
				assert.ok(text.includes('/social/xiaohongshu-avatar.webp?v=20261114'), `Avatar favicon missing in ${entry.name}`);
				assert.ok(!text.includes('href="/favicon.svg"'), 'Old H favicon is still linked');
			}
			count++;
		}
	}
	return count;
}
const checked = await checkGenerated(path.join(root, 'dist'));
console.log(`PASS: ${items.length} verified entries, ${ids.size} detail pages, old article URLs, avatar favicon; ${checked} generated files scanned for identifying details.`);
