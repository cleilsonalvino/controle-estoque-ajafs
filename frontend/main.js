import { app, BrowserWindow, ipcMain, shell } from "electron";
import path from "path";
import fetch from "node-fetch"; // npm install node-fetch
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = !app.isPackaged;

async function waitForVite(url, retries = 10, delay = 500) {
  for (let i = 0; i < retries; i++) {
    try {
      await fetch(url);
      return;
    } catch {
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}

async function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: true,
    autoHideMenuBar: true,
    title: "Sistema de Gestão empresarial - AJAFS",
    icon: path.join(__dirname, "public", "logo.png"),
    webPreferences: {
      //preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // impede que links externos abram dentro do app
  win.webContents.on("will-navigate", (event, url) => {
    if (url.startsWith("http") && !url.startsWith("http://localhost")) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  if (isDev) {
    const url = "http://localhost:8080";
    await waitForVite(url);
    win.loadURL(url);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "dist", "index.html"));
  }
}

/*
ipcMain.on("window-close", () => {
  BrowserWindow.getFocusedWindow()?.close();
});
ipcMain.on("window-minimize", () => {
  BrowserWindow.getFocusedWindow()?.minimize();
});
ipcMain.on("window-maximize", () => {
  const win = BrowserWindow.getFocusedWindow();
  if (!win) return;
  if (win.isMaximized()) win.unmaximize();
  else win.maximize();
});

ipcMain.on("devOps", () => {
  BrowserWindow.getFocusedWindow()?.webContents.openDevTools();
});
*/

app.whenReady().then(() => {
  createWindow();
});
