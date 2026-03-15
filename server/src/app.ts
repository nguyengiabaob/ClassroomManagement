import "dotenv/config";
import express from "express";
import cors from "cors";
import apiRoutes from "./routers";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", apiRoutes);
const startServer = async () => {
  try {
    // Start the server

    const port = 3000;
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

startServer();
