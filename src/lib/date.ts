// 日期统一按北京时间格式化。直接 toISOString() 会按 UTC 算，在 +08 的机器上会早一天
export const ymd = (d: Date) => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai' }).format(d);
