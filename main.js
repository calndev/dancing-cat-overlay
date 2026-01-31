const { app, BrowserWindow, ipcMain, screen, Menu, Tray } = require('electron');
const path = require('path');

let mainWindow;
let tray;
let isClickable = true;

function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    mainWindow = new BrowserWindow({
        width: 300,
        height: 300,
        x: width - 350,
        y: height - 350,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        resizable: true,
        hasShadow: false,
        skipTaskbar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    mainWindow.loadFile('index.html');
}

function updateMenus() {
    const contextMenuTemplate = [
        {
            label: 'Stay on top :3',
            type: 'checkbox',
            checked: mainWindow ? mainWindow.isAlwaysOnTop() : true,
            click: (item) => {
                mainWindow.setAlwaysOnTop(item.checked);
                updateMenus();
            }
        },
        {
            label: 'toggle clickability :)',
            type: 'checkbox',
            checked: isClickable,
            click: () => {
                toggleClickability();
            }
        },
        { type: 'separator' },
        {
            label: 'close kitty :(',
            click: () => {
                app.quit();
            }
        }
    ];

    const trayMenuTemplate = [
        ...contextMenuTemplate
    ];

    const contextMenu = Menu.buildFromTemplate(contextMenuTemplate);
    const trayMenu = Menu.buildFromTemplate(trayMenuTemplate);

    if (tray) {
        tray.setContextMenu(trayMenu);
    }

    return contextMenu;
}

function toggleClickability() {
    isClickable = !isClickable;

    if (mainWindow) {
        if (isClickable) {
            mainWindow.setIgnoreMouseEvents(false);
        } else {
            mainWindow.setIgnoreMouseEvents(true, { forward: true });
        }
    }
    updateMenus();
}

app.whenReady().then(() => {
    createWindow();

    const iconPath = path.join(__dirname, 'assets', 'icon.png');
    tray = new Tray(iconPath);
    tray.setToolTip('Dancing Cat Overlay');

    updateMenus();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.on('window-move', (event, { x, y }) => {
    if (!mainWindow) return;
    const [currentX, currentY] = mainWindow.getPosition();
    mainWindow.setPosition(currentX + x, currentY + y);
});

ipcMain.on('show-context-menu', () => {
    const menu = updateMenus();
    menu.popup({ window: BrowserWindow.fromWebContents(mainWindow.webContents) });
});
