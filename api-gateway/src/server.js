import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('\n Gateway escuchando en http://localhost:${PORT}');
  console.log('User Service: ${process.env.USER_SERVICE_URL || "http://localhost:5001"}\n');
});