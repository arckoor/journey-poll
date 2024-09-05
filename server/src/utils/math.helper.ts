export function gcd(a: number, b: number) {
	if (a === 0) return Math.abs(b);
	if (b === 0) return Math.abs(a);
	let h: number;
	do {
		h = a % b;
		a = b;
		b = h;
	} while (b != 0);
	return Math.abs(a);
}

export function calculateAspectRatio(width: number, height: number) {
	const div = gcd(width, height);
	return `${width/div}/${height/div}`;
}
