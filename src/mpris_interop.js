const Player = require('mpris-service');

let mpris = {
  instance: undefined
};

const createMpris = async () => {
  mpris.instance = Player({
    name: 'AppleMusic',
    identity: 'Apple Music',
    supportedUriSchemes: [],
    supportedMimeTypes: [],
    supportedInterfaces: ['player']
  });

  let pos_atr = { durationInMillis: 0 };
  let currentPlayBackProgress = "0";

  mpris.instance.getPosition = () => {
    const durationInMicro = pos_atr.durationInMillis * 1000;
    const percentage = parseFloat(currentPlayBackProgress) || 0;
    return durationInMicro * percentage;
  }

  mpris.instance.canQuit = true;
  mpris.instance.canControl = true;
  mpris.instance.canPause = true;
  mpris.instance.canPlay = true;
  mpris.instance.canGoNext = true;
  mpris.instance.metadata = { 'mpris:trackid': '/org/mpris/MediaPlayer2/TrackList/NoTrack' };
  mpris.instance.playbackStatus = 'Stopped';
};

module.exports = {
  mpris,
  createMpris
}
