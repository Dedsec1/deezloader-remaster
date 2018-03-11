# DeezLoader Reborn V3.0.15
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

# Download Links
- Windows installer: [DeezLoader-3.0.15-win-64&32-installer.exe](https://mega.nz/#!0A8DDLgD!X7kbV5O-g91lLvpmJm8dvCA7RrprxcQ64sUlOEtn5L8)
- Windows x64 portable: [DeezLoader-3.0.15-win-64-portable.7z](https://mega.nz/#!pYlRTKwD!aHLERuYfoVOi2SZzWNxJYLZGqk2OAukU9R2QFlVMlsA)
- Windows x86 portable: [DeezLoader-3.0.15-win-32-portable.7z](https://mega.nz/#!ZJVCjKRR!MuWjPZlF7iauwJqvEfDX33UfhqN0mSCp4BUa4v1fpKQ)
- Linux x64: [DeezLoader-3.0.15-linux-64.AppImage](https://mega.nz/#!lB9XkIyT!tNc1PQoOtRJFgYMB8IkOKBgGAZ1sqRqNMd7lwyLtcsk)
- Linux x86: [DeezLoader-3.0.15-linux-32.AppImage](https://mega.nz/#!cIVURDTT!c5qZAJj-FeEXh38bVga9AiKGaq8GsVi-inRfVw5FWGA)
- Mac x64: [DeezLoader-3.0.15-mac-64.dmg](https://mega.nz/#!wVkCFDgI!HLik6GymkQv1palTOHM074hYcZdUHZMcxZsol3AS5LY)
- Older versions: [Releases](https://gitlab.com/ExtendLord/DeezLoader-Reborn/tags)
- Android: [Android installation guide](https://gitlab.com/ExtendLord/DeezLoader-Reborn#how-to-run-on-android)

# Virus total
- Windows installer: [DeezLoader-3.0.15-win-64&32-installer.exe](https://www.virustotal.com/#/file/ba8714d7055e66bf196b02bca9e761f47a964b352a7faf0fb4d9d968ee16bfd8/detection)
- Linux x64: [DeezLoader-3.0.15-linux-64.AppImage](https://www.virustotal.com/#/file/75af8a808286b13cbec507fa26f4383a350d44ef764859bb13c550ad72c6f244)
- Linux x86: [DeezLoader-3.0.15-linux-32.AppImage](https://www.virustotal.com/#/file/7941030d1de3f53d45c204c17035766cbaabae11744600679eb7311f13f02404)
- Mac x64: [DeezLoader-3.0.15-mac-64.dmg](https://www.virustotal.com/#/file/703b292f48438b2523b4a79893b809ddaf9936a8056d0f6a7ac63a4419e55730)

# Donations
- **BTC/BCH:** 1A25gu2vMXLfQBYArYLMBcTpnuwPiKW6vL
- **LTC:** LbrVLYkmJ3k2woXACMKshg8KqbMqt1yhAz
- **Paypal:** extendlord@gmail.com

# How to run
- Download the installer and run it.
- Run DeezLoader.

## How to run on Android

Installing DeezLoader on Android is a little bit complicated but easy.<br/>
If you did installed DeezLoader and would like to just run it, go to step [5](https://gitlab.com/ExtendLord/DeezLoader-Reborn#5-run).

### How to update on Android

If you would like to update DeezLoader on android you need to first delete the folder

```
rm -rf DeezLoader-Reborn
```

Then follow from step [3](https://gitlab.com/ExtendLord/DeezLoader-Reborn#3-download)

### 1. Install Termux
In order to have DeezLoader on Android you must install `termux`.
- Play Store: [link](https://play.google.com/store/apps/details?id=com.termux)
- Apk Mirror: [link](https://www.apkmirror.com/apk/fredrik-fornwall/termux)

### 2. Install dependencies
Run `Termux` and enter those lines in order:
```
pkg update
pkg upgrade
pkg install git nodejs
```
If it asks you if you want to continue, enter `y`.

### 3. Download

To download the master(latest) version:
```
git clone https://gitlab.com/ExtendLord/DeezLoader-Reborn
```
To download the release version:
```
git clone --branch v3.0.15 https://gitlab.com/ExtendLord/DeezLoader-Reborn
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
