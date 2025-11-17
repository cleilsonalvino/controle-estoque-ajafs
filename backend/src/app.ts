import express from "express";
import "dotenv/config";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import router from "./app/routes";
import { errorHandler } from "./app/middlewares/error";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";

const app = express();

// Carrega o arquivo Swagger
const swaggerDocument = YAML.load(path.join(__dirname, '..', 'swagger.yaml'));

app.use(cors());
app.use(
  helmet({
    crossOriginResourcePolicy: false, // Desativa o bloqueio de recursos entre origens
  })
);
app.use(morgan("dev"));
app.use(express.json());

// Servir arquivos estáticos da pasta uploads
app.use('/api/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Rota da documentação da API
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api", router);


app.get("/api", (req, res) => {
    res.send("API is running");
});


app.use(errorHandler);

export default app;
