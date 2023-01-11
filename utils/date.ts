export function addDays(date: Date, days: number) {
	date.setDate(date.getDate() + days);
	return date;
}

export function toDateInputValue(date: Date) {
	const local = new Date(date);
	local.setMinutes(date.getMinutes() - date.getTimezoneOffset());
	return local.toJSON().slice(0, 16);
}

export function countdown(date: string, callback: (str: string) => void) {
	const countdownDate = new Date(date).getTime();
	const ct = setInterval(() => {
		const now = Date.now();
		const distance = countdownDate - now;
		const days = Math.floor(distance / (1000 * 60 * 60 * 24));
		const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((distance % (1000 * 60)) / 1000);
		let endStr = "";
		if (days) {
			endStr = `${days}d ${hours}h ${minutes}m`;
		} else if (hours) {
			endStr = `${hours}h ${minutes}m ${seconds}s`;
		} else if (minutes) {
			endStr = `${minutes}m ${seconds}s`;
		} else {
			endStr = `${seconds}s`;
		}
		callback(endStr);
		if (distance < 0) {
			clearInterval(ct);
			callback("0s");
		}
	}, 1000);
	return ct;
}
