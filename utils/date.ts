export function addDays(date: Date, days: number) {
	date.setDate(date.getDate() + days);
	return date;
}

export function toDateInputValue(date: Date) {
	const local = new Date(date);
	local.setMinutes(date.getMinutes() - date.getTimezoneOffset());
	return local.toJSON().slice(0, 16);
}

export function toLocalTimeZone(date: Date) {
	const offset = new Date().getTimezoneOffset();
	date.setMinutes(date.getMinutes() - offset);
	return date.toISOString().replace("Z", "");
}

export function makeDateFromConfig(time: string, days: string) {
	if (!time && !days) return null;
	const date = new Date();
	if (time) {
		const [hours, minutes] = time.split(":");
		date.setHours(+hours);
		date.setMinutes(+minutes);
	}
	if (days) addDays(date, +days);
	return toDateInputValue(date);
}
