const { app, BrowserWindow } = require("electron");
const path = require("path");
function createWindow() {
  const window = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 620,
    backgroundColor: "#F5F5F5",
    icon: path.join(__dirname, '../public/vallet_icon.png'), 
    webPreferences: { contextIsolation: true, nodeIntegration: false },
  });
  if (!app.isPackaged) window.loadURL("http://localhost:5173");
  else window.loadFile(path.join(__dirname, "../dist/index.html"));
}
app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
