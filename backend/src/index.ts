import app from "./app";
import chalk from "chalk";


const PORT = process.env.PORT || 3009;

app.listen(PORT, () => {
  console.log(chalk.green(`Servidor rodando na porta ${PORT}`));
});
