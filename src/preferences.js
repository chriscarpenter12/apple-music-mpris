const { app, nativeTheme } = require('electron');
const ElectronPreferences = require('electron-preferences');
const path = require('path');

const preferences = new ElectronPreferences({
  dataStore: path.resolve(app.getPath('userData'), 'preferences.json'),
  defaults: {
    theme: {
      theme: 'system'
    }
  },
  sections: [
    {
      id: 'theme',
      label: 'Theme',
      icon: 'brightness-6',
      form: {
        groups: [
          {
            fields: [
              {
                label: 'Theme',
                key: 'theme',
                type: 'radio',
                options: [
                  { label: 'System (default)', value: 'system' },
                  { label: 'Light', value: 'light' },
                  { label: 'Dark', value: 'dark' }
                ],
                help: 'Changing the theme requires an application relaunch to apply window frame theme.'
              }
            ]
          }
        ]
      }
    }
  ]
});

nativeTheme.themeSource = preferences.preferences.theme.theme;
preferences.on('save', (preferences) => {
  nativeTheme.themeSource = preferences.theme.theme;
});

module.exports = {
  preferences
};
