import app from "./app";
import chalk from "chalk";
import "./app/config/cron"; // Importa para iniciar o cron job

const PORT = process.env.PORT;
const PORT_NUMBER = PORT ? parseInt(PORT, 10) : 3000;



app.listen(PORT_NUMBER, "0.0.0.0", () => {
  console.log(chalk.green(`Servidor disponível em http://localhost:${PORT_NUMBER}/api`));
  console.log(chalk.green(`Documentação disponível em http://localhost:${PORT}/api/docs`));
});
