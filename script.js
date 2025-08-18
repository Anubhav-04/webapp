// If running in browser → get real input
// If running in Node (tests) → mock an object
let display;
if (typeof document !== "undefined") {
  display = document.getElementById("display");
} else {
  display = { value: "" }; // mock for Jest
}

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
    display.value = eval(display.value).toString(); // simple evaluation
  } catch (e) {
    display.value = "Error";
  }
}

// Export only in Node (for tests)
if (typeof module !== "undefined") {
  module.exports = { display, appendChar, clearDisplay, deleteChar, calculate };
}
