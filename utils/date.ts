export function addDays(date: Date, days: number) {
	date.setDate(date.getDate() + days);
	return date;
}

export function toDateInputValue(date: Date) {
	const local = new Date(date);
	local.setMinutes(date.getMinutes() - date.getTimezoneOffset());
	return local.toJSON().slice(0, 10);
}
