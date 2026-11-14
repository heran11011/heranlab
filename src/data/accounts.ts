// 公开账号资料与精选内容的静态快照。核对日期：2026-11-13。
// 来源和筛选边界见 accounts.sources.md；不收录“仅自己可见”的内容，不展示粉丝数。
// 小红书 xsec_token 是公开内容分享校验参数，不是登录凭证；不保存 Cookie。
export interface Account {
	id: string;
	label: string;
	name: string;
	handle?: string;
	href: string | null;
	description: string;
	avatar?: string;
	qr?: { src: string; alt: string; caption: string };
	itemsLabel?: string;
	items: { title: string; href: string; kind?: string }[];
	note?: string;
	verifiedAt?: string;
}

export const accounts: Account[] = [
	{
		id: 'wechat', label: '公众号', name: '禾冉一起', href: null,
		description: '扫码在微信中打开公众号。',
		qr: { src: '/social/wechat-official-qr.jpg', alt: '公众号“禾冉一起”的关注二维码', caption: '微信扫一扫，关注“禾冉一起”' },
		items: [],
	},
	{
		id: 'xiaohongshu', label: '小红书', name: '禾冉一起', handle: 'heran11011',
		href: 'https://www.xiaohongshu.com/user/profile/663de8950000000007005e04',
		description: 'AI Skills 开发、自动化工作流，分享 AI 使用技巧。',
		avatar: '/social/xiaohongshu-avatar.webp',
		qr: { src: '/social/xiaohongshu-qr.jpg', alt: '小红书“禾冉一起”的主页二维码', caption: '小红书扫一扫，找到我' },
		itemsLabel: '精选笔记',
		items: [
			{ title: '我们在 AdventureX 做了一个黑客松作品：DAWdex。', kind: '自己做的项目', href: 'https://www.xiaohongshu.com/explore/6a6551da0000000011006278?xsec_token=ABFXLkaEp2NwTL2AdPfLxwAB0-LpWTWUWfbuPhyxmQ_BY%3D&xsec_source=pc_user' },
			{ title: 'DeepSeek V4 隐藏玩法，角色扮演直接封神', kind: 'AI 使用技巧', href: 'https://www.xiaohongshu.com/explore/69edc05f000000003502ccc4?xsec_token=ABjkIcpqm9FPDtHz1KYHB93yM38MC1cOg_ZFbPTBW7l58%3D&xsec_source=pc_user' },
			{ title: '5.5k⭐ 的小黑 skill，我改成了自己的形象', kind: '创作过程', href: 'https://www.xiaohongshu.com/explore/6a38ab92000000000f02b753?xsec_token=ABB1peaNwj2EcLPxhDRjIjcCasTG-52aFLad7YeZVETxw%3D&xsec_source=pc_user' },
		],
		note: '笔记可能需要登录小红书；链接失效时可从主页或二维码进入。', verifiedAt: '2026-11-13',
	},
	{
		id: 'x', label: 'X', name: 'Heran', handle: '@heran_ai', href: 'https://x.com/heran_ai',
		description: '用这个号记录我在 AI 行业里的所见所感。',
		itemsLabel: '精选帖子',
		items: [
			{ title: '本来想试试，让 AI 去给我的手机号充话费', kind: '自动化实测', href: 'https://x.com/heran_ai/status/2112344331868877238' },
			{ title: '我发现让 ai 写推特是真的抽象啊', kind: '日常观察', href: 'https://x.com/heran_ai/status/2109876678747193375' },
		], note: 'X 在部分网络环境下可能无法打开。', verifiedAt: '2026-11-13',
	},
	{
		id: 'bilibili', label: 'B 站', name: '禾冉heran', handle: 'UID 1078313778',
		href: 'https://space.bilibili.com/1078313778',
		description: 'AI Skills 开发、自动化工作流，分享 AI 使用技巧。',
		avatar: '/social/bilibili-avatar.jpg', itemsLabel: '公开视频',
		items: [
			{ title: '当弹幕开始作曲，音乐被反转了', kind: 'DAWdex 演示', href: 'https://www.bilibili.com/video/BV1LA3j6vE6d/' },
			{ title: '能有什么不遗憾的，还是没得到...', kind: '早期视频', href: 'https://www.bilibili.com/video/BV1LG411K7U6/' },
		], verifiedAt: '2026-11-13',
	},
	{
		id: 'github', label: 'GitHub', name: 'huntingrin', handle: '@huntingrin', href: 'https://github.com/huntingrin',
		description: '公开的 Agent Skill 与工具源码。', avatar: '/social/github-avatar.jpg', itemsLabel: '精选仓库',
		items: [
			{ title: 'xhs-opportunity-kit', kind: '小红书机会管理 SDK', href: 'https://github.com/huntingrin/xhs-opportunity-kit' },
			{ title: 'seedance-anime-prompt-library', kind: '动画视频提示词库', href: 'https://github.com/huntingrin/seedance-anime-prompt-library' },
			{ title: 'jd-bean-claim', kind: '京东京豆签到 Skill', href: 'https://github.com/huntingrin/jd-bean-claim' },
		], verifiedAt: '2026-11-13',
	},
];
