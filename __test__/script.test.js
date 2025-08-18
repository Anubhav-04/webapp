const { display, appendChar, clearDisplay, deleteChar, calculate } = require("../script");

beforeEach(() => {
  clearDisplay();
});

test("appendChar should add characters to display", () => {
  appendChar("5");
  appendChar("+");
  appendChar("2");
  expect(display.value).toBe("5+2");
});

test("clearDisplay should empty the display", () => {
  appendChar("123");
  clearDisplay();
  expect(display.value).toBe("");
});

test("deleteChar should remove last character", () => {
  appendChar("123");
  deleteChar();
  expect(display.value).toBe("12");
});

test("calculate should evaluate expression", () => {
  appendChar("10");
  appendChar("+");
  appendChar("5");
  calculate();
  expect(display.value).toBe("15");
});

test("calculate should handle invalid expression", () => {
  appendChar("10++");
  calculate();
  expect(display.value).toBe("Error");
});
