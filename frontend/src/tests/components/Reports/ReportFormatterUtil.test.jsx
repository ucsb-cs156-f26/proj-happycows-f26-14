import { formatter } from "main/components/Reports/ReportFormatterUtil";

describe("ReportFormatterUtil tests", () => {
  test("formats numbers as US dollars", () => {
    expect(formatter.format(1234.5)).toBe("$1,234.50");
    expect(formatter.format(0)).toBe("$0.00");
    expect(formatter.format(-7.125)).toBe("-$7.13");
  });
});
