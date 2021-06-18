const { ipcRenderer } = require('electron');
const { MusicKitInterop } = require('./musickit_interop');

process.once('loaded', () => {
  global.ipcRenderer = ipcRenderer;
  global.MusicKitInterop = MusicKitInterop;
});
