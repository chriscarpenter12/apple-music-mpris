const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const isDev = require('electron-is-dev');
const windowStateKeeper = require('electron-window-state');
const fs = require('fs');
const path = require('path');
const { mpris } = require('./mpris_interop');
const { preferences } = require('./preferences');

let mainWindow;
let mainWindowState;

function setPlaybackIfNeeded(status) {
  if (mpris.instance.playbackStatus === status) {
    return;
  }
  mpris.instance.playbackStatus = status;
}

const playbackStatusPlay = 'Playing';
const playbackStatusPause = 'Paused';
const playbackStatusStop = 'Stopped';

const createWindow = async () => {
  mainWindowState = windowStateKeeper({
    defaultWidth: 1024,
    defaultHeight: 768,
  });

  const menu = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Preferences',
          accelerator: 'Ctrl+,',
          click: async () => {
            preferences.show();
          },
        },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    { role: 'viewMenu' },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));

  mainWindow = new BrowserWindow({
    title: app.name,
    icon: path.join(__dirname, '../assets/icon.png'),
    autoHideMenuBar: true,
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    minWidth: 640,
    minHeight: 480,
    backgroundColor: preferences.preferences.theme.theme === 'dark' ? '#1f1f1f' : '#ffffff',
    darkTheme: preferences.preferences.theme.theme === 'dark',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: false,
      backgroundThrottling: false,
      autoplayPolicy: 'no-user-gesture-required',
    },
  });

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  mainWindowState.manage(mainWindow);

  mainWindow.on('close', (event) => {
    event.preventDefault();
    mainWindow.destroy();
  });

  mpris.instance.on('playpause', async () => {
    if (mpris.instance.playbackStatus === 'Playing') {
      await mainWindow.webContents.executeJavaScript('MusicKit.getInstance().pause()');
    } else {
      await mainWindow.webContents.executeJavaScript('MusicKit.getInstance().play()');
    }
  });
  mpris.instance.on('play', async () => {
    await mainWindow.webContents.executeJavaScript('MusicKit.getInstance().play()');
  });
  mpris.instance.on('pause', async () => {
    await mainWindow.webContents.executeJavaScript('MusicKit.getInstance().pause()');
  });
  mpris.instance.on('next', async () => {
    await mainWindow.webContents.executeJavaScript('MusicKit.getInstance().skipToNextItem()');
  });
  mpris.instance.on('previous', async () => {
    await mainWindow.webContents.executeJavaScript('MusicKit.getInstance().skipToPreviousItem()');
  });

  ipcMain.on('mediaItemStateDidChange', (item, a) => {
    updateMetaData(a);
  });

  ipcMain.on('playbackStateDidChange', (item, a) => {
    switch (a) {
      case 0:
        if (isDev) {
          console.log('NONE');
        }
        setPlaybackIfNeeded(playbackStatusPause);
        break;
      case 1:
        if (isDev) {
          console.log('loading');
        }
        setPlaybackIfNeeded(playbackStatusPause);
        break;
      case 2:
        if (isDev) {
          console.log('playing');
        }
        setPlaybackIfNeeded(playbackStatusPlay);
        break;
      case 3:
        if (isDev) {
          console.log('paused');
        }
        setPlaybackIfNeeded(playbackStatusPause);
        break;
      case 4:
        if (isDev) {
          console.log('stopped');
        }
        setPlaybackIfNeeded(playbackStatusStop);
        break;
      case 5:
        if (isDev) {
          console.log('ended');
        }
        break;
      case 6:
        if (isDev) {
          console.log('seeking');
        }
        break;
      case 7:
        if (isDev) {
          console.log('waiting');
        }
        break;
      case 8:
        if (isDev) {
          console.log('stalled');
        }
        break;
      case 9:
        if (isDev) {
          console.log('completed');
        }
        break;
    }

    return mainWindow;
  });

  mainWindow.webContents.once('did-stop-loading', async () => {
    await mainWindow.webContents.executeJavaScript(`MusicKitInterop.init()`);

    fs.readFile(path.join(__dirname, '../assets/style-overrides.css'), 'utf-8', (error, data) => {
      if (!error) {
        mainWindow.webContents.insertCSS(data);
      }
    });
  });

  await mainWindow.loadURL('https://music.apple.com');

  async function updateMetaData(attributes) {
    let m = { 'mpris:trackid': '/org/mpris/MediaPlayer2/TrackList/NoTrack' };
    if (attributes == null) {
      return;
      // } else if (attributes.playParams.id === 'no-id-found') {
    } else {
      let url = `${attributes.artwork.url.replace('/{w}x{h}bb', '/35x35bb')}`;
      url = `${url.replace('/2000x2000bb', '/35x35bb')}`;
      m = {
        'mpris:trackid': mpris.instance.objectPath(`track/${attributes.playParams.id.replace(/[.]+/g, '')}`),
        'mpris:length': attributes.durationInMillis * 1000, // In microseconds
        'mpris:artUrl': url,
        'xesam:title': `${attributes.name}`,
        'xesam:album': `${attributes.albumName}`,
        'xesam:artist': [`${attributes.artistName}`],
        'xesam:genre': attributes.genreNames,
      };
    }
    if (mpris.instance.metadata['mpris:trackid'] === m['mpris:trackid']) {
      return;
    }
    mpris.instance.metadata = m;
  }
};

module.exports = {
  createWindow,
};
