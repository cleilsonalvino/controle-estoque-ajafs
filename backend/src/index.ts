import app from "./app";
import chalk from "chalk";
import "./app/config/cron"; // Importa para iniciar o cron job

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(chalk.green(`Servidor rodando na porta ${PORT}`));
});
