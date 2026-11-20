import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8');
const css = await read('src/styles/global.css');
const home = await read('dist/index.html');
const catalog = await read('dist/content/index.html');
const about = await read('dist/about/index.html');
const missing = await read('dist/404.html');
const head = await read('src/components/BaseHead.astro');
const portal = await read('src/components/home/PortalDesk.astro');

// 测量语义色的真实对比度，而不是仅要求色值“看起来深一点”。
const luminance = (hex) => {
	const linear = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255)
		.map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
	return linear.reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
};
const contrast = (a, b) => {
	const [low, high] = [luminance(a), luminance(b)].sort((x, y) => x - y);
	return (high + 0.05) / (low + 0.05);
};
const roles = (block) => Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[a-f\d]{6})\b/gi)].map((match) => [match[1], match[2]]));
const base = roles(css.match(/:root\s*\{([^}]+)\}/)?.[1] || '');
let pairs = 0;
let minimum = Infinity;
for (const tone of ['paper', 'forest', 'night']) {
	const pattern = new RegExp(`:root\\[data-tone='${tone}'\\]\\s*\\{([^}]+)\\}`);
	const palette = { ...base, ...roles(css.match(pattern)?.[1] || '') };
	for (const ink of ['ink', 'ink-2', 'ink-3', 'accent']) {
		for (const paper of ['paper', 'paper-2', 'paper-3']) {
			assert.match(palette[ink] || '', /^#[a-f\d]{6}$/i, `Missing ${tone}/${ink}`);
			assert.match(palette[paper] || '', /^#[a-f\d]{6}$/i, `Missing ${tone}/${paper}`);
			const ratio = contrast(palette[ink], palette[paper]);
			assert.ok(ratio >= 4.5, `${tone}: ${ink} on ${paper} is ${ratio.toFixed(3)}:1, below 4.5:1`);
			minimum = Math.min(minimum, ratio);
			pairs++;
		}
	}
}

// 底纸保持独立尺寸，动画纸不能再被带负外边距的窗口裁掉。
assert.match(portal, /\.portal-stack\s*\{[^}]*\bdisplay:\s*flow-root\b/, 'Paper stack needs an independent layout context');
assert.match(portal, /\.portal-stage\s*\{[^}]*\boverflow:\s*visible\b/, 'Lifted papers must not be clipped by their animation stage');
assert.ok(!/\.portal-stage\s*\{[^}]*(?:padding|margin):/.test(portal), 'Animation-space padding and negative margins must not enlarge the backing papers');
assert.ok(home.includes('data-home-portal'), 'Homepage must stay a simple introduction and interactive portal');
assert.equal((home.match(/<a\b[^>]*\bdata-home-pick\b/g) || []).length, 1, 'Homepage should feature one public pick without becoming a feed');
assert.match(home, /<a\b(?=[^>]*\bdata-home-pick\b)(?=[^>]*\bhref="\/content\/[^"/]+\/")[^>]*>/, 'Desk pick must link to an existing public content route');
for (const obsolete of ['desk-clippings', 'desk-colophon', 'data-scrapbook', 'data-home-reading']) assert.ok(!home.includes(obsolete), `Removed homepage clutter returned: ${obsolete}`);
assert.equal((home.match(/role="tab"/g) || []).length, 4, 'Four destination bookmarks missing');
for (const control of ['data-portal-tabs', 'data-portal-controls']) assert.match(home, new RegExp(`<div\\b(?=[^>]*\\b${control}\\b)(?=[^>]*\\bhidden\\b)[^>]*>`), 'No-JS switching controls must remain hidden');
assert.ok(home.includes('data-portal-prev') && home.includes('data-portal-next'), 'Explicit paper controls missing');
assert.ok(home.includes('data-portal-status') && home.includes('aria-live="polite"'), 'Paper switching announcement missing');
for (const view of ['illustrated', 'catalog']) assert.ok(catalog.includes(`data-view="${view}"`), `Catalog view missing: ${view}`);
assert.match(catalog, /<div\b(?=[^>]*\bdata-library-controls\b)(?=[^>]*\bhidden\b)[^>]*>/, 'No-JS search controls must remain hidden');
assert.ok(catalog.includes('data-library-reset'), 'Empty-state reset missing');
for (const id of ['content-catalog-title', 'content-accounts-title']) {
	assert.ok(catalog.includes(`href="#${id}"`) && catalog.includes(`id="${id}"`), `Missing content jump: ${id}`);
}
for (const page of [home, about, catalog, missing]) assert.ok(page.includes('href="#page-top"'), 'Footer must provide a native no-JS return to the top');
const caseNotes = [...catalog.matchAll(/<details\b(?=[^>]*\bdata-case-note\b)[^>]*>[\s\S]*?<\/details>/g)];
assert.equal(caseNotes.length, 3, 'Keep the case shelf to three native disclosures');
assert.ok(!home.includes('data-case-shelf'), 'Case shelf belongs on the content page');
const destinations = caseNotes.map(([note]) => {
	assert.match(note, /<summary\b/, 'Case disclosure must work without JavaScript');
	assert.doesNotMatch(note, /^<details\b[^>]*\bopen\b/, 'Case notes start collapsed');
	return note.match(/<a\s+href="(\/content\/[^"/]+\/)"/)?.[1];
});
assert.deepEqual(destinations, ['/content/dawdex-adventurex/', '/content/wechat-rpa-ai-archive/', '/content/wechat-gr3-companion/']);
for (const page of [about, catalog]) {
	const tiles = [...page.matchAll(/<div\b[^>]*\bdata-account="([^" ]+)"[^>]*>[\s\S]*?<\/details>/g)];
	assert.deepEqual(tiles.map(([, id]) => id), ['wechat', 'xiaohongshu', 'x', 'bilibili', 'github']);
	for (const [, id] of tiles.slice(0, 2)) {
		const tile = tiles.find(([, platform]) => platform === id)[0];
		assert.match(tile, /<section\b[^>]*>\s*<figure\b[^>]*>\s*<img\b[^>]*-qr\.jpg/, `${id} preview must lead with the QR code`);
	}
	for (const [id, href] of [['x', 'https://x.com/heran_ai'], ['github', 'https://github.com/heran11011']]) {
		const tile = tiles.find(([, platform]) => platform === id)[0];
		assert.ok(tile.split('<details')[0].includes(`href="${href}"`), `${id} needs a direct link independent of disclosure`);
	}
	const wechat = tiles[0][0];
	assert.doesNotMatch(wechat, /<a\b[^>]*href="\/content\/[^"\s]+"[^>]*target=/, 'Site articles should stay in the same tab');
	for (const [, id] of tiles.slice(2)) assert.doesNotMatch(tiles.find(([, platform]) => id === platform)[0], /class="account-home"/, `Duplicate account home link: ${id}`);
	assert.doesNotMatch(page, /github\.com\/huntingrin/);
}
assert.ok(missing.includes('href="https://github.com/heran11011"'));
// 只验证域名护栏与静态 HTML；是否真的不联网仍由浏览器核验。
assert.match(head, /if \(!\['heranlab\.com', 'www\.heranlab\.com'\]\.includes\(location\.hostname\)\) return;/, 'Preview analytics hostname guard missing');
assert.ok(!/<script\b[^>]*src="https:\/\/www\.googletagmanager\.com/i.test(home), 'Preview HTML must not eagerly load analytics');
console.log(`PASS: ${pairs} text/paper contrast pairs (minimum ${minimum.toFixed(3)}:1), paper portal/catalog controls, no-JS controls and preview analytics guard. Browser interaction checks are separate.`);
