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
