import express from "express";
import "dotenv/config";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import router from "./app/routes.ts";
import { errorHandler } from "./app/middlewares/error.ts";

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api", router);


app.use(errorHandler);

export default app;