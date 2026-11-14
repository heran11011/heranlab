// 对外只使用禾冉 / heran。这里不保存本名、学校、所在地、毕业年份或任职履历。
// 公开账号资料见 accounts.ts；数字需要出处，公司内部数据与身份底账不上站。
import { accounts } from './accounts';

export const profile = {
	name: '禾冉',
	nameEn: 'heran',
	email: 'heran11011@gmail.com',

	// 首屏那句话仍是草稿，等待本人确认。
	headline: { before: '做增长运营，', br: true, mid: '也', hl: '自己写工具', after: '。', todo: '草稿' },
	intro: null as string | null,

	facts: [
		{ k: '运营', v: '用户召回、渠道、线下地推和内容分发。' },
		{ k: '工具', v: '把常用流程写成 Agent Skill，也做插件。' },
		{ k: '写作', v: '记录 AI 工具的使用和自己做过的项目。' },
	],

	// 只保留作品进展，不展示个人求学与任职时间线。
	timeline: [
		{ when: '2026.06', title: 'obsidian-cola', desc: '两周从零做到提交 Obsidian 社区插件库。', href: '/work/obsidian-cola/' },
		{ when: '2026', title: 'Agent Skill', desc: '把常用的自动化流程写成 skill，陆续公开在 GitHub。', href: '/work/agent-skills/' },
		{ when: '进行中', title: '空心菜大棚种植系统', desc: '基于 STM32，包含硬件、云平台和 App。', href: '/work/stm32-greenhouse/' },
	],

	skills: ['增长运营', '用户召回', '线下地推', '渠道投放', '数据复盘', '内容选题与写作', '多平台分发', '自己出物料', '把想法做成 MVP', '物联网 / 嵌入式'],
	platforms: accounts,
} as const;
