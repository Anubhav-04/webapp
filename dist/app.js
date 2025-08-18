const express = require("express");
const app = express();
const PORT = process.env.PORT || 3030;

app.get("/", (req, res) => {
  res.send("Hello from my simple web app 🚀");
});

app.get("/todos", (req, res) => {
  res.json([{ id: 1, task: "Deploy to Vercel" }]);
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app; // for testing
