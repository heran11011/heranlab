// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://heranlab.com',
	integrations: [mdx(), sitemap()],
	// 字体文件在 src/assets/fonts/（自托管，构建不依赖外网）。
	// 中文衬线不在这里：思源宋体整套太大，中文标题先用系统宋体（见 global.css 的 --serif-zh）。
	fonts: [
		{
			provider: fontProviders.local(),
			name: 'Instrument Serif',
			cssVariable: '--font-instrument',
			fallbacks: ['Georgia'],
			options: {
				variants: [{ src: ['./src/assets/fonts/instrument-serif-400.woff2'], weight: 400, style: 'normal', display: 'swap' }],
			},
		},
		{
			provider: fontProviders.local(),
			name: 'JetBrains Mono',
			cssVariable: '--font-jetbrains',
			fallbacks: ['Menlo'],
			options: {
				variants: [{ src: ['./src/assets/fonts/jetbrains-mono-400.woff2'], weight: '400 500', style: 'normal', display: 'swap' }],
			},
		},
	],
});
