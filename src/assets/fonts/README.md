# 字体

- `instrument-serif-400.woff2`：Instrument Serif，SIL Open Font License 1.1
- `jetbrains-mono-400.woff2`：JetBrains Mono（可变字体，latin 子集），SIL Open Font License 1.1

两个都从 Google Fonts 下载的 latin 子集，放在仓库里自托管，构建不依赖外网。
中文衬线没有放：思源宋体整套太大，中文标题先用系统宋体（见 `src/styles/global.css` 的 `--serif-zh`）。
