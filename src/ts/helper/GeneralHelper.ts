export function ShuffleArray (array: []): [] {
	let length = array.length;
	let index: number;
	while (length > 0) {
		index = Math.floor(Math.random() * length--);
		[array[length], array[index]] = [array[index], array[length]];
	}
	return array;
}

export function get (callbackValue: () => any, fallbackValue: any = null): unknown {
	let val = fallbackValue;
	try {
		val = callbackValue();
		if (typeof val === 'undefined') {
			return fallbackValue;
		}
	}
	catch {}
	return val;
}
