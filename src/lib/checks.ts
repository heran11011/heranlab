// 构建时的两道提醒（只打印警告，不让构建失败）：
// 1. 页面上还有多少“待补”
// 2. 作品里出现了数字，但没写 sources

const seenTodos = new Set<string>();
export function noteTodo(where: string, what: string) {
	const key = `${where} · ${what}`;
	if (seenTodos.has(key)) return;
	seenTodos.add(key);
	console.warn(`[待补] ${key}`);
}

// 去掉日期、年份、版本号、型号（STM32、ESP32）之后还剩数字，就算“有数字”
const DATEISH = /\b20\d{2}([.\-/]\d{1,2}){0,2}\b|\bv?\d+\.\d+(\.\d+)?\b|[A-Za-z]+\d+[A-Za-z\d]*/g;
export function checkSources(id: string, text: string, sources: readonly string[] | undefined) {
	const left = text.replace(DATEISH, '').match(/\d+/g);
	if (left && (!sources || sources.length === 0)) {
		console.warn(`[缺出处] 作品 ${id} 里有数字（${[...new Set(left)].slice(0, 5).join('、')}），但 sources 为空`);
	}
}
