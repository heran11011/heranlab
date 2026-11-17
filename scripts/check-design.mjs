import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8');
const css = await read('src/styles/global.css');
const home = await read('dist/index.html');
const catalog = await read('dist/content/index.html');
const head = await read('src/components/BaseHead.astro');

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

assert.ok(home.includes('data-scrapbook="aligned"'), 'Default homepage must use calm, aligned covers');
assert.ok(!home.includes('desk-clippings') && !home.includes('desk-colophon'), 'Redundant hero decorations must stay removed');
assert.match(home, /<details\b(?=[^>]*\bdata-deck-topic-menu\b)(?![^>]*\bopen\b)[^>]*>/, 'Low-frequency paper filters should start closed, not hide the paper itself');
assert.match(home, /<details\b(?=[^>]*class="reading-order")(?![^>]*\bopen\b)[^>]*>/, 'Cover layout settings should start closed');
for (const order of ['scattered', 'aligned']) assert.ok(home.includes(`data-scrapbook-order="${order}"`), `Layout toggle missing: ${order}`);
assert.match(home, /<div\b(?=[^>]*class="reading-tools")(?=[^>]*\bhidden\b)[^>]*>/, 'No-JS layout controls must remain hidden');
for (const view of ['illustrated', 'catalog']) assert.ok(catalog.includes(`data-view="${view}"`), `Catalog view missing: ${view}`);
assert.match(catalog, /<div\b(?=[^>]*\bdata-library-controls\b)(?=[^>]*\bhidden\b)[^>]*>/, 'No-JS search controls must remain hidden');
assert.ok(catalog.includes('data-library-reset'), 'Empty-state reset missing');
// 只验证域名护栏与静态 HTML；是否真的不联网仍由浏览器核验。
assert.match(head, /if \(!\['heranlab\.com', 'www\.heranlab\.com'\]\.includes\(location\.hostname\)\) return;/, 'Preview analytics hostname guard missing');
assert.ok(!/<script\b[^>]*src="https:\/\/www\.googletagmanager\.com/i.test(home), 'Preview HTML must not eagerly load analytics');
console.log(`PASS: ${pairs} text/paper contrast pairs (minimum ${minimum.toFixed(3)}:1), scrapbook/catalog controls, no-JS controls and preview analytics guard. Browser interaction checks are separate.`);
