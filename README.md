# DeezLoader Reborn V3.0.8
DeezLoader Reborn is here to replace the old DeezLoader V2.3.1.<br/>
With this software you can download high-qualiy music and enjoy.

**In order to download FLAC quality you need to turn on HIFI in settings.**<br/>
**Please post problems in issues, do not PM me or comment in the reddit post**

# Features
- Download FLAC/MP3-320 music content from Deezer(FLAC needs to be turned on in the settings 'turn on HIFI')
- Search musics
- Use Deezer links as an alternative for Searching and downloading inside the software
- Download multiple musics at a time
- Download Albums and artists
- Tagging system on MP3-320 and FLAC
- Simple and user friendly

# Donations
- **BTC/BCH:** 1A25gu2vMXLfQBYArYLMBcTpnuwPiKW6vL
- **LTC:** LbrVLYkmJ3k2woXACMKshg8KqbMqt1yhAz

# How to run
- Download the installer and run it.
- Run DeezLoader.

## How to run on Android

Installing DeezLoader on Android is a little bit complicated but easy.<br/>
If you did installed DeezLoader and would like to just run it, go to the last step.

### 1. Install Termux
In order to have DeezLoader on Android you must install `termux`.
- Play Store: [link](https://play.google.com/store/apps/details?id=com.termux)
- Apk Mirror: [link](https://www.apkmirror.com/apk/fredrik-fornwall/termux)

### 2. Install dependencies
Run `Termux` and enter those lines in order:
```
pkg update
pkg upgrade
pkg install git
pkg install nodejs
```
If it asks you if you want to continue, enter `y`.

### 3. Download

To download the latest(experimental) version:
```
git clone https://gitlab.com/ExtendLord/DeezLoader-Reborn
```
To download the release version:
```
git clone --branch v3.0.8 https://gitlab.com/ExtendLord/DeezLoader-Reborn
```
Then navigate to the app folder using this command
```
cd DeezLoader-Reborn/app
```

### 4. Install

Now lets install what we have downloaded
```
npm install
```
In order for DeezLoader to work we need to setup storage for termux
```
termux-setup-storage
```

### 5. Run

In order to run make sure that you are in DeezLoader-Reborn/app folder run
```
cd DeezLoader-Reborn/app
```

Run the server side script
```
node app.js
```

And then go to your browser and enter to this site

[http://localhost:1730](http://localhost:1730)

# How to compile
- Download Node JS latest version
- Clone the repository(Download the zip file or clone using git)
- Run compile.sh/bat or run the command `npm install && npm run dist` or `yarn install && yarn run dist` if you have `yarn` installed
- Go to dist and you will see the installer and the software folder
- Have fun(Easy Peasy)

**If you are a linux user and it returns an error or stucks at creating AppImage then go to `package.json` and delete this**

```
"win":{
	"icon": "res/icon.ico"
},
"mac":{
	"icon": "res/icon.icns"
},
```

# Download Links
- Windows x64: [DeezLoader-3.0.8-win-64.exe](https://mega.nz/#!8UEUSQAA!7zZAlF0KknCmcI8oObP7vXdUvUNgZ0ipZun0fRLvanY)
- Windows x86: [DeezLoader-3.0.8-win-32.exe](https://mega.nz/#!Yd81jRbR!AocFUIRAP0ku86S-RmomLW3CDXB8c0eSNX_P94Ndfog)
- Linux x64: [DeezLoader-3.0.8-linux-64.AppImage](https://mega.nz/#!pZFmEDyY!qVtoe1iTdxam0IsEKsTMj7VluomqEvlLFROzW7jDtZk)
- Linux x86: [DeezLoader-3.0.8-linux-32.AppImage](https://mega.nz/#!IQdQiT6D!16cTW9_DwP1kGn07NAcS_i9rNwIRVF70JcnR3RhA9Sg)
- Mac x64: [DeezLoader-3.0.8-mac-64.dmg](https://mega.nz/#!dNsjRIaL!QG58pReDTubPyHVp9LQyvOtNcL4owr5HZxpN_deQnRU)
- Android: [Android installation guide](https://gitlab.com/ExtendLord/DeezLoader-Reborn#how-to-run-on-android)

# Virus total
- Windows x64: [DeezLoader-3.0.8-win-64.exe](https://www.virustotal.com/#/file/4ef1f5f22b81f5b7296fd2c1ec31ff7ee17e5de9ffce86863c57f78cb4c19316)
- Windows x86: [DeezLoader-3.0.8-win-32.exe](https://www.virustotal.com/#/file/9b4112b448b49299c954919d2930a7eaae9e8548f42a59ecc0819b8b3aecfc0b)
- Linux x64: [DeezLoader-3.0.8-linux-64.AppImage](https://www.virustotal.com/#/file/aa380339085720869b524b55f81958b1aa69867886fe24cd0081c4f771929c09)
- Linux x86: [DeezLoader-3.0.8-linux-32.AppImage](https://www.virustotal.com/#/file/c0446499b93ae09aa0aa23cde4f3e092e35144bc813047171e5d439ac9c2f7dc)
- Mac x64: [DeezLoader-3.0.8-mac-64.dmg](https://www.virustotal.com/#/file/3898f1db1b0e7a750d73c33528967f56ae763baa550af7076832f62d1d840f82)

# Credits
## Original Developer
[ZzMTV](https://boerse.to/members/zzmtv.3378614/)

## Former Maintainers
[ParadoxalManiak](https://github.com/ParadoxalManiak)<br/>
[snwflake](https://github.com/snwflake)

## Maintainers
[ExtendLord](https://github.com/ExtendLord)

# Disclaimer
- I am not responsible for the usage of this program by other people.
- I do not recommend you doing this illegally or against Deezer's terms of service.
- This project is licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)
