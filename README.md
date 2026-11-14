# 禾冉 heran

个人内容网站，使用 Astro，部署在 Cloudflare Pages。视觉为纸本便签；公开仅使用“禾冉 / heran”，不放身份履历与公司内部数据。

- 正式站：https://heranlab.com
- redesign 预览：https://redesign.heranlab.pages.dev

## 本地

```sh
npm install
npm run dev
npm run build
npm run check:content
```

## 首页与阅读交互

首页先展示真实图文精选和横向视频放映架，再放工具作品、介绍与联系方式；无公开封面的内容仅用文字，不伪造图片。

- `src/components/home/`：图文条目与视频横滑，主题筛选、键盘翻动与 reduced motion。
- `src/lib/home.ts`：主题分类及已核验封面的尺寸/放行范围。
- `src/components/ThemePicker.astro`：暖纸、森林、夜色；本地保存阅读配色，跨页面恢复。
- `src/components/ReadingTools.astro`：按实际滚动更新进度、回到顶部，不持续运行动画循环。
- `public/social/avatar-round.png`：本人授权的原头像圆形透明裁切，未重新画人物。

交互参考本地 Delicacy HTML 的换肤、横滑与阅读提示，仅借形式，不搬参考文件中的人物资料、项目文案或花丛画布。无 JavaScript 时核心内容与视频横滑仍可读，非功能控件隐藏。

## 内容与来源

- `src/data/profile.ts`：对外介绍、作品进展与公开联系方式。
- `src/content/work/`：作品详情；待补位置在构建时提示。
- `src/data/accounts.ts`：公开账号与平台入口。
- `src/data/library.json`：本人公开笔记、帖子与视频简介的静态快照。
- `src/data/library.sources.md`：作者/公开状态核验、正文整理与封面隐私边界。
- `src/pages/content/`：内容索引与站内阅读页；搜索和平台筛选，无 JavaScript 时全部内容可读。
- `src/content/blog/`：原有文章，旧 URL 保留。

新内容需核对作者、公开状态与隐私后再收录；不在访客端抓取平台，不保存登录凭据，不嵌入视频/平台页面。视频观看到原平台，短简介不扩写成完整文章。公众号暂仅提供二维码，尚无已核验的文章列表。

`main` 为正式站，`redesign` 为预览分支；通过 Git 集成自动构建部署。
