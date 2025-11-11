import { app, BrowserWindow, ipcMain, shell } from "electron";
import path from "path";
import fetch from "node-fetch"; // npm install node-fetch
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = !app.isPackaged;

async function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: true,
    autoHideMenuBar: true,
    title: "Sistema de Gestão empresarial - AJAFS",
    icon: path.join(__dirname, "public", "favicon.ico"), // ← use o .ico aqui
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // impede que links externos abram dentro do app
  win.webContents.on("will-navigate", (event, url) => {
    if (
      url.startsWith("http") &&
      !url.startsWith("https://sistema.ajafs.com.br/")
    ) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  if (isDev) {
    win.loadURL("http://localhost:8080");
  } else {
    win.loadURL("https://sistema.ajafs.com.br");
  }
}

app.whenReady().then(() => {
  createWindow();
});
