// https://stackoverflow.com/a/46545530/12203337
/* eslint-disable-next-line @typescript-eslint/no-explicit-any*/
export function shuffle(a: Array<any>) {
	return a.map(v => ({ v, sort: Math.random() })).sort((q, s) => q.sort - s.sort).map(({ v }) => v);
}
