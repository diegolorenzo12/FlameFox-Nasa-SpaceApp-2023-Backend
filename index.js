require("dotenv").config();
const { PORT } = require("./src/configs/ws");

const app = require("./src/app");

app.listen(PORT, () => {
  console.log("Server started on port " + PORT);
});
