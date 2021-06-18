const { app } = require('electron');
const { createWindow } = require('./window');
const { createMpris } = require('./mpris_interop');

let mainWindow;
app.commandLine.appendSwitch('disable-features', 'HardwareMediaKeyHandling');

const instanceLock = app.requestSingleInstanceLock();

if (!instanceLock) {
  app.quit();
} else {
  app.on('widevine-ready', async () => {
    await createMpris();
    mainWindow = await createWindow();
  });
}

app.on('widevine-error', (error) => {
  console.log('Widevine installation encountered an error: ' + error)
  process.exit(1);
});

app.on('window-all-closed', () => {
  // mpris.metadata = { 'mpris:trackid': '/org/mpris/MediaPlayer2/TrackList/NoTrack' };
  // mpris.playbackStatus = 'Stopped';
  app.quit();
});

app.on('quit', () => {
  // mpris.metadata = { 'mpris:trackid': '/org/mpris/MediaPlayer2/TrackList/NoTrack' };
  // mpris.playbackStatus = 'Stopped';
  app.quit();
});

