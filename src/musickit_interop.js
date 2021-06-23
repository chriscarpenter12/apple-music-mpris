const MusicKitInterop = {
  init: () => {
    window.MusicKit.getInstance().addEventListener(window.MusicKit.Events.playbackStateDidChange, (a) => {
      window.ipcRenderer.send('playbackStateDidChange', a.state);
    });
    window.MusicKit.getInstance().addEventListener(window.MusicKit.Events.mediaItemStateDidChange, (mediaItem) => {
      window.ipcRenderer.send('mediaItemStateDidChange', MusicKitInterop.getAttributes(mediaItem));
    });
  },
  getAttributes: (mediaItem) => {
    let attributes = {};

    if (mediaItem != null) {
      attributes = mediaItem.attributes;
    }
    attributes.name = attributes.name ? attributes.name : 'No Title Found';
    attributes.durationInMillis = attributes.durationInMillis ? attributes.durationInMillis : 0;
    attributes.artwork = attributes.artwork ? attributes.artwork : { url: '' };
    attributes.artwork.url = attributes.artwork.url ? attributes.artwork.url : '';
    attributes.playParams = attributes.playParams ? attributes.playParams : { id: 'no-id-found' };
    attributes.playParams.id = attributes.playParams.id ? attributes.playParams.id : 'no-id-found';
    attributes.albumName = attributes.albumName ? attributes.albumName : 'No Album Found';
    attributes.artistName = attributes.artistName ? attributes.artistName : 'No Artist Found';
    attributes.genreNames = attributes.genreNames ? attributes.genreNames : [];
    return attributes;
  },
};

module.exports = {
  MusicKitInterop,
};
