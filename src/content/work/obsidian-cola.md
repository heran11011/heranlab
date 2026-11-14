---
title: obsidian-cola
titleLang: en
summary: Obsidian 的 AI 侧边栏插件。写笔记时不用切窗口，选中一段直接问 Cola，回复一键插回光标位置。
group: tools
kind: 工具
period: '2026.06'
order: 1
featured: true
wide: true
meta:
  - { k: 角色, v: 独立开发 }
  - { k: 时间, v: 2026.06，两周 }
  - { k: 技术, v: TypeScript · WebSocket · Obsidian Plugin API }
  - { k: 状态, v: 已提交 Obsidian 社区插件库和 Cola 插件商店, todo: 核对 }
shots:
  - { caption: 侧边栏对话 }
  - { caption: 选中文本 → 插回光标 }
links:
  - { label: GitHub, href: 'https://github.com/heran11011/obsidian-cola' }
  - { label: 开发日志（英文）, href: /blog/building-obsidian-ai-plugin-from-scratch/ }
sources:
  - 开发日志 /blog/building-obsidian-ai-plugin-from-scratch/：two-week sprint；重连 3s → 6s → 12s → 30s max；submitted to both
---

## 做了什么

1. 本地 WebSocket 桥接：一个 Cola 渠道插件起本地服务，Obsidian 插件连上去，不走外网。
2. 首次启动自动生成本地令牌，Obsidian 那边读文件完成认证，用户不用配置。
3. 侧边栏对话，自动带上当前打开的文件作为上下文。
4. 选中文本发给 Cola；每条回复带“插入”按钮，一键写回光标位置。
5. 断线自动重连，间隔 3 秒、6 秒、12 秒，最长 30 秒。
