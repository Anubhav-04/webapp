let display = { value: "" }; // mockable in tests

function appendChar(char) {
  display.value += char;
}

function clearDisplay() {
  display.value = "";
}

function deleteChar() {
  display.value = display.value.slice(0, -1);
}

function calculate() {
  try {
    display.value = eval(display.value).toString();
  } catch (e) {
    display.value = "Error";
  }
}

// Export for tests
module.exports = { display, appendChar, clearDisplay, deleteChar, calculate };
