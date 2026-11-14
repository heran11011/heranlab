---
title: Agent Skill 集
summary: 把常用的自动化流程写成 skill，公开在 GitHub。huntingrin 名下 30+ 个公开仓库（截至 2026-11-13）。
group: tools
kind: 工具
period: '2026'
order: 2
featured: true
meta:
  - { k: 角色, v: 独立开发 }
  - { k: 时间, v: 2026 至今 }
  - { k: 形式, v: Agent Skill（SKILL.md + 脚本） }
  - { k: 数量, v: 30+ 个公开仓库（截至 2026-11-13） }
command:
  text: npx skills add huntingrin/xhs-opportunity-kit
  todo: 待实测
shots:
  - { caption: 一个 skill 跑起来的样子 }
links:
  - { label: GitHub · huntingrin, href: 'https://github.com/huntingrin' }
sources:
  - gh repo list huntingrin：非 fork 的公开仓库 34 个（2026-11-13 查询）
---

## 几个例子

- **xhs-opportunity-kit**：小红书机会管理，搜索、证据核验、去重、筛选与导出。
- **carrier-points-redeem**：移动、联通、电信积分兑换的统一入口，按运营商自动分到对应的子 skill。
- **jd-bean-claim**：京东京豆补领与每日签到，带到账核对和中断恢复。
- **handoff**：长任务跨对话续接，用本地检查点接上进度。
- **make-90s-tutorial-video**：90 秒教程视频的可复用模板。

## 共同的做法

- 碰到下单、支付、验证码，停下来交还给人。
- 做完要核对结果，比如积分是否真的到账。
