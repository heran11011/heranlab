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

首页是一张个人书桌：署名和头像、可按主题翻动的真实内容纸签，再接图文精选、视频放映架、工具与联系方式。手机纸签默认收起，留出首屏给内容；桌面展开。无公开封面的内容仅用文字，不伪造图片。

- `src/components/home/`：个人署名、内容纸签、章节导航、图文条目与视频横滑。原生按钮和链接支持键盘；动效遵守 reduced motion。
- `src/lib/home.ts`：主题分类及已核验封面的尺寸/放行范围。
- `src/components/ThemePicker.astro`：暖纸、森林、夜色；本地保存阅读配色，跨页面恢复。
- `src/components/ReadingTools.astro`：按实际滚动更新进度、回到顶部，不持续运行动画循环。
- `public/social/avatar-soft-square.png`：本人授权的原头像圆角方形透明裁切；圆角为边长的 1/6，与站内头像一致，未重新画人物。

交互参考本地 Delicacy HTML 的大字、边注、留白、轻弹性、换肤和横滑，仅借形式，不搬参考文件中的人物资料、项目文案或花丛画布。无 JavaScript 时第一张纸签与全部图文仍可读，章节锚点、视频横滑和原图链接可用，非功能控件隐藏。

## 阅读页

- `src/components/content/ReaderPreferences.astro`：小／标准／大字号、专注模式、返回与下一篇，操作条随阅读停在顶栏下面。字号与专注状态只保存在本机 `localStorage`，禁用存储时仍能使用。
- `src/components/content/ImageViewer.astro`：缩略图 + 原生 `dialog` 查看原图，关闭、Escape、空白处关闭与焦点返回；手机按钮至少 44 px，无 JavaScript 时提供原图链接。
- `src/pages/content/[...slug].astro`：笔记左文右图、短帖保持短、视频封面和播放入口优先；手机单列。原文不重写，来源与核对日期保留在折叠记录里，前后篇导航不伪装成时间排序。
- `src/layouts/BlogPost.astro`：两篇旧文章共用阅读工具，保留原文和旧 URL。

`check:content` 除隐私与链接外，也逐段核对原文未改动、阅读工具／图片查看器存在、纸签和头像一致性。公众号长文通过结构化 blocks 渲染标题、段落、引用、代码和原图，不注入微信 HTML 或远程样式；有隐私风险的图片不搬运，阅读页单独标注缺图说明。

## 内容与来源

- `src/data/profile.ts`：对外介绍、作品进展与公开联系方式。
- `src/content/work/`：作品详情；待补位置在构建时提示。
- `src/data/accounts.ts`：公开账号与平台入口。
- `src/data/library.json`：本人公开笔记、帖子与视频简介的静态快照。
- `src/data/library.sources.md`：作者/公开状态核验、正文整理与封面隐私边界。
- `src/data/wechat.sources.json`：公众号已发表原创的公开链接、原文比对摘要与图片来源 / SHA-256；不保存后台数据或登录状态。
- `src/pages/content/`：内容索引与站内阅读页；搜索和平台筛选，无 JavaScript 时全部内容可读。
- `src/content/blog/`：原有文章，旧 URL 保留。

新内容需核对作者、公开状态与隐私后再收录；不在访客端抓取平台，不保存登录凭据，不嵌入视频/平台页面。视频观看到原平台，短简介不扩写成完整文章。公众号“禾冉一起”已整理 12 篇已发表原创长短文，保留原题、原文顺序和发布日期；转载、临时预览链接、含身份履历的文章未同步。

`main` 为正式站，`redesign` 为预览分支；通过 Git 集成自动构建部署。
