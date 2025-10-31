import express from "express";
import "dotenv/config";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import router from "./app/routes";
import { errorHandler } from "./app/middlewares/error";

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api", router);

app.get("/api", (req, res) => {
    res.send("API is running");
});


app.use(errorHandler);

export default app;
