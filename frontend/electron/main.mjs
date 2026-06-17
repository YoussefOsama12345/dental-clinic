import { app, BrowserWindow, shell } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const isDev = Boolean(process.env.VITE_DEV_SERVER_URL)

if (isDev) {
  // Keep Electron's dev profile/cache in a short, writable temp path. This avoids
  // Windows cache permission errors when running from Git Bash/WSL or when the
  // project is inside a synced/protected directory.
  const devUserDataPath = process.env.ELECTRON_USER_DATA_DIR ?? path.join(app.getPath('temp'), 'dentai-electron-dev')
  fs.mkdirSync(devUserDataPath, { recursive: true })
  app.setPath('userData', devUserDataPath)
  app.commandLine.appendSwitch('disk-cache-dir', path.join(devUserDataPath, 'Cache'))
  app.commandLine.appendSwitch('disable-gpu-shader-disk-cache')
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1540,
    height: 960,
    minWidth: 1280,
    minHeight: 800,
    backgroundColor: '#e9eff2',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  win.webContents.on('will-navigate', (event, url) => {
    const allowedPrefix = process.env.VITE_DEV_SERVER_URL ?? 'file://'
    if (!url.startsWith(allowedPrefix)) {
      event.preventDefault()
      shell.openExternal(url)
    }
  })

  if (isDev) win.loadURL(`${process.env.VITE_DEV_SERVER_URL}#/login`)
  else win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'), { hash: '/login' })
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
