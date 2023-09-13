export const getPercentValue = (b: number, f: number, p: number) => {
	return b + (f - b) * p;
};

export const parseTime = (val: string | number) => {
	if (!val) return 0;
	const str = `${val}`;
	const value = parseFloat(str);
	if (/ms/.test(str)) {
		return value;
	}
	if (/s/.test(str)) {
		return value * 1000;
	}
	if (/min/.test(str)) {
		return value * 60 * 1000;
	}
	return value;
};
