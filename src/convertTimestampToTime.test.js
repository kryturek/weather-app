import convertTimestamptoTime from "./convertTimestampToTime";

test("converts UNIX timestamp to time string", () => {
	expect(convertTimestamptoTime(1621620000, 0)).toBe("18:00:00");
});

test("converts UNIX timestamp with an hour added", () => {
	expect(convertTimestamptoTime(1621620000, 3600)).toBe("19:00:00");
});

test("converts UNIX timestamp with hour subtracted", () => {
	expect(convertTimestamptoTime(1621620000, -3600)).toBe("17:00:00");
});
