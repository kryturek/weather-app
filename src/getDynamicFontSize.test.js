import getDynamicFontSize from "./getDynamicFontSize";

test('"Ouagadougou" string returns 36px', () => {
	expect(getDynamicFontSize("Ouagadougou")).toBe("36px");
});

test('"Koło" string returns 36px', () => {
	expect(getDynamicFontSize("Koło")).toBe("48px");
});

test('"Santa Eulàlia de Ronçana" string returns 24px', () => {
	expect(getDynamicFontSize("Santa Eulàlia de Ronçana")).toBe("24px");
});
