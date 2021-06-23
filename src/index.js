require('v8-compile-cache');
const { app } = require('electron');
const { createWindow } = require('./window');
const { createMpris } = require('./mpris_interop');

app.commandLine.appendSwitch('disable-features', 'HardwareMediaKeyHandling');

const instanceLock = app.requestSingleInstanceLock();

if (!instanceLock) {
  app.quit();
} else {
  app.on('widevine-ready', async () => {
    await createMpris();
    await createWindow();
  });
}

app.on('widevine-error', (error) => {
  console.log('Widevine installation encountered an error: ' + error);
  process.exit(1);
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('quit', () => {
  app.quit();
});
