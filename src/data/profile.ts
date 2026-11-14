// 禾冉的个人资料：全站只从这里取。改一处，首页、关于页、页脚一起变。
//
// 规矩：
// - 每个数字都要能指回出处，指不回来就删
// - 不写公司内部数据（用户数、收入、留存、付费……）
// - 手机号、身份证号、学号不上站
// - 中文引号用 “”
// - todo: true 的条目会在页面上显示“待补”，构建时也会在终端列出来

import { accounts } from './accounts';

export const profile = {
	name: '禾冉',
	nameEn: 'Heran',
	realName: '牛浩冉',
	city: '郑州',
	cityEn: 'ZHENGZHOU · UTC+8',
	email: 'heran11011@gmail.com',

	// 首屏那句话。现在是草稿，等禾冉口述替换；hl 是荧光笔划线的部分
	headline: { before: '做增长运营，', br: true, mid: '也', hl: '自己写工具', after: '。', todo: '草稿' },

	// 关于页开头的一段自我介绍（100 字以内）。null = 待补
	intro: null as string | null,

	facts: [
		{ k: '现在', v: '火星回响增长运营实习，做 Cola / ListenHub 的用户召回、渠道和地推' },
		{ k: '之前', v: '虚实传媒，MCN 运营实习' },
		{ k: '在读', v: '河南牧业经济学院 · 物联网工程 · 2027 届' },
		{ k: '在', v: '郑州' },
	],

	school: { name: '河南牧业经济学院', major: '物联网工程', degree: '本科', grad: '2027 届' },

	experience: [
		{
			period: '2026.01 – 至今',
			org: '火星回响（MarsWave）',
			role: '增长运营实习',
			desc: '做 Cola / ListenHub 的增长：用户召回、渠道投放、线下地推、内容分发。',
		},
		{
			period: '2025.07 – 2025.12',
			org: '虚实传媒',
			role: 'MCN 运营实习',
			desc: '管签约达人的内容与商单流转。',
		},
	],

	// 首页和关于页的时间线。href 指向站内作品页时会变成链接
	timeline: [
		{ when: '2025.07 – 2025.12', title: '虚实传媒 · MCN 运营实习', desc: '管签约达人的内容与商单流转。' },
		{ when: '2026.01 – 至今', title: '火星回响 · 增长运营实习', desc: '做 Cola / ListenHub 的用户召回、渠道投放、线下地推和内容分发。' },
		{ when: '2026.06', title: 'obsidian-cola', desc: '两周从零做到提交 Obsidian 社区插件库。', href: '/work/obsidian-cola/' },
		{ when: '2026', title: 'Agent Skill', desc: '把常用的自动化流程写成 skill，陆续公开在 GitHub。', href: '/work/agent-skills/' },
		{ when: '2027.06', title: '毕业', desc: '河南牧业经济学院，物联网工程。' },
	],

	// 能力标签：资料底稿第五节，他愿意被这样描述的
	skills: ['增长运营', '用户召回', '线下地推', '渠道投放', '数据复盘', '内容选题与写作', '多平台分发', '自己出物料', '把想法做成 MVP', '物联网 / 嵌入式背景'],

	// 首页、关于页、404 页共用的公开账号资料。
	platforms: accounts,
} as const;
