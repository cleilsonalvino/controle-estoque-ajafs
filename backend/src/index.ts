import app from "./app.ts";
import chalk from "chalk";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(chalk.green(`Servidor rodando na porta ${PORT}`));
});