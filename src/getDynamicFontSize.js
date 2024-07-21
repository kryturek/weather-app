function getDynamicFontSize(str) {
	const smolSize = 24;
	const midSize = 36;
	const maxSize = 44;

	if (str.length < 9) {
		return `${maxSize}px`;
	} else if (str.length <= 15) {
		return `${midSize}px`;
	} else {
		return `${smolSize}px`;
	}
}

export default getDynamicFontSize;
