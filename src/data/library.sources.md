# 个人内容页的采集与编辑记录

核对：2026-11-14。只整理本人公开发布的创作，数据为静态快照，不保存 Cookie、登录 token、通知、私信、后台或收藏内容。`library.json` 为站上数据；`library.ts` 定义类型和平台标签。

## 采集方式

- 小红书：从本人 UID `663de8950000000007005e04` 的笔记列表筛选；卡片出现“仅自己可见”的条目排除。详情页核对 `note.user.userId` 等于上述 UID，随后只提取标题、正文、平台发布时间、公开视频形式与原始配图。用平台数据字段 `time` 转为 Asia/Shanghai 日期，不从笔记 ID 猜发布时间。正文保留作者内容，只删除平台话题标记、调整段落空白和把直角引号改为中文双引号；不把平台 bio / IP 属地带进内容。
- X：两条公开帖子通过原始 status URL 读取全文，作者为 `Heran (@heran_ai)`。未拿到可靠的原页时间字段，因此不展示发布时间；核对日期不充当发布时间。标题用本人开头摘句，摘要为编辑介绍。帖内金额是历史原文，不是本站核验过的收益承诺。
- B 站：两条视频逐一确认 `videoData.owner.mid = 1078313778`，只保存标题、公开简介、`pubdate` 日期、封面和原始 URL；不下载或重传视频，不嵌入 iframe。
- 旧站两篇英文文章保留原 URL，由 Astro blog collection 提供，内容页增加入口，不冒充本次抓取产出。

## 首批条目

| 站内 ID | 平台原 ID | 核对结果 |
| --- | --- | --- |
| dawdex-adventurex | 6a6551da0000000011006278 | 作者 UID 匹配，公开；正文与封面 |
| deepseek-roleplay | 69edc05f000000003502ccc4 | 作者 UID 匹配，公开；正文与封面 |
| my-xiaohei-skill | 6a38ab92000000000f02b753 | 作者 UID 匹配，公开视频；简介，无封面 |
| mac-autofill | 6ad7418b00000000250363ff | 作者 UID 匹配，公开；正文与封面 |
| personal-card-with-ai | 69fc735900000000350319c0 | 作者 UID 匹配，公开视频；简介，无封面 |
| meme-art-origin | 693fb30b000000001e000491 | 作者 UID 匹配，公开；正文与原笔记引用图 |
| dawdex-video | BV1LA3j6vE6d | uploader mid 匹配，公开；简介与封面 |
| early-video-regret | BV1LG411K7U6 | uploader mid 匹配，公开；简介与封面 |
| ai-phone-credit | 2112344331868877238 | 公开帖子，作者 @heran_ai；全文 |
| ai-writing-on-x | 2109876678747193375 | 公开帖子，作者 @heran_ai；全文 |

## 隐私与转载边界

- 六张使用的封面逐张做视觉检查：无本人校名、本名、手机号、个人地址、公司后台数据或真人出镜。
- “小黑 skill”和“个人名片”视频原封面有真人画中画，后者另含学生身份，均不搬到本站，不裁剪/重画。
- “自媒体多平台数据监控”涉及公司运营后台，未纳入此次合集，也没有搬封面或正文。
- 表情包溯源封面是原笔记里的公开 Reddit 引用和艺术作品，随笔记记录出处，不宣称艺术作品是本人原创；作品版权属于原作者。
- 小红书详情链接含平台公开分享校验 `xsec_token`，不是登录凭据，可能过期；内容页保留主页/二维码兜底。
- 公众号首批记录建立时没有可核验列表；2026-11-15 经本人登录后，从“禾冉一起”的已发表记录取得公开链接，核对原页账号与原创标记，导入 12 篇全文（见下方）。转载和临时预览条目不收录。
- 页面明确标注“笔记原文”“帖子原文”或“视频简介原文”；短简介不扩写成文章，视频播放仍到原平台。

## 更新

采集和整理发生在本机，不在访客端发平台请求；无需访客授权。新增内容需重新核对作者、公开状态、隐私、正文与配图，更新 `verifiedAt`。站内不展示粉丝数、赞数等动态指标；原题、原文里的历史数字不替换成新的实时宣称。

## 公众号同步 · 2026-11-15

从本人登录后的“已发表记录”取得公开原文链接；只读取发表条目的账号、原创标记、公开 URL，正文与配图从公开文章页采集，不保存后台参数、数据统计、草稿或临时预览地址。核对了 25 篇标记原创，首批选择以下 12 篇技术实验和随笔。

标题取公开原页（修改后的原页可能与后台列表的旧标题不同）；发布日期取原页显示的本地日期。署名归一为“禾冉 / 禾冉一起”，不把平台历史昵称或身份履历带进站。正文只整理段落空白、移除零宽字符并统一中文引号；原始错别字、历史数字和当时的技术观点不重写，不作为本站重新核验的实时结论。所有文字与原页 `#js_content` 去空白比对一致；校验摘要在 wechat.sources.json。

| 站内 ID | 发布日期 | 正文 | 原文 |
| --- | --- | --- | --- |
| wechat-gr3-companion | 2025-08-08 | 原文全文 | [公众号](https://mp.weixin.qq.com/s/VFxYP3GAZTK4rB7z86hM4w) |
| wechat-rpa-ai-archive | 2025-05-30 | 原文全文 | [公众号](https://mp.weixin.qq.com/s/yRi9QrvQatmRQxmE78npBg) |
| wechat-pixels-and-heartbeats | 2025-05-13 | 原文全文 | [公众号](https://mp.weixin.qq.com/s/i2urC5Jiovwsejf54_CXPA) |
| wechat-deepseek-prompt-helper | 2025-04-15 | 原文全文 | [公众号](https://mp.weixin.qq.com/s/MzxMr945eOnqlSuKKac2bg) |
| wechat-order-anxiety | 2025-02-18 | 原文全文 | [公众号](https://mp.weixin.qq.com/s/kV1TXGrG2O6LcPYzSDWsCw) |
| wechat-lantern-festival-smoke | 2025-02-12 | 原文全文 | [公众号](https://mp.weixin.qq.com/s/ne3rv2gDm8mRhkN5NPp0Rg) |
| wechat-think-beyond-today | 2025-02-10 | 原文全文 | [公众号](https://mp.weixin.qq.com/s/tpQDx6alL7f-w8F90lMWoA) |
| wechat-start-before-ready | 2025-02-09 | 原文全文 | [公众号](https://mp.weixin.qq.com/s/_9XHf_f45NcAFiINeX-E9A) |
| wechat-approval-trap | 2025-02-08 | 原文全文 | [公众号](https://mp.weixin.qq.com/s/lISfY8ypNV1Jl0h4QIUrLw) |
| wechat-moment-of-realization | 2024-12-05 | 原文全文 | [公众号](https://mp.weixin.qq.com/s/BWi20ZnzM6DPCLfKbV0SYw) |
| wechat-upside-down-world | 2024-12-04 | 原文全文 | [公众号](https://mp.weixin.qq.com/s/W4yETPKYHrCSuEJLfG_wWg) |
| wechat-meet-on-a-better-summit | 2024-12-01 | 原文全文 | [公众号](https://mp.weixin.qq.com/s/wd0Bnr-6NN_wZYcL5oElzw) |

51 张候选封面/正文图片逐张做视觉检查，保留 48 个原图文件，供 12 张封面和 37 次正文配图引用（有一张图在原文出现两次）；不裁剪、涂改或重画。RPA 教程的一张图露出私人账号信息，像素/寻亲文章的一张未成年人肖像和一张无法确认脱敏的寻亲信息图未同步，页面单独提示缺图。正文中的公开新闻/电影/提示词引用保留出处，不宣称为本站原创，也不把参考作者创作认领为本人作品。其余待整理的原创不冒充已同步；转载、临时预览条目、含身份信息的篇目未收录。

首页选读增加 RPA 教程和 GR-3 体验，公众号账号便签补入 3 篇站内选读。此次为静态同步，不启用周期性抓取或后台自动发布。
