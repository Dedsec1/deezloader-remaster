# DeezLoader Remaster V4.0.3 final
DeezLoader Remaster is here to replace the old DeezLoader V2.3.1. and DeezLoader Reborn<br/>
With this software you can download high-qualiy music and enjoy.

Source code - https://github.com/Deezloader/DeezLoader-Reborn<br/>

Telegram Channel - https://t.me/joinchat/AAAAAFCRjRpUr-IF96RV3g

# Features
- Download FLAC/MP3-320 music content from Deezer(FLAC needs to be turned on in the settings 'turn on HIFI')
- Search musics
- Use Deezer links as an alternative for Searching and downloading inside the software
- Download multiple musics at a time
- Download Albums and artists
- Tagging system on MP3-320 and FLAC
- Simple and user friendly

# Remaster features
- Soundiiz integration to convert playlists
- Download your own playlists directly

# Donations
- **BTC:** 3DVsShXt4GpPax6hSqatTFRJxM2VQ7jnpa
- **BTH:** 1KqvH7E2e1amABmLVt1bM9q11TmaMeioed
- **ETH:** 0x2140A5126aa2F85A4a98862E573A6214EA49325B
- **Paypal:** ivandelabeldad@gmail.com

# How to run
- Download the installer and run it.
- Run DeezLoader.

## How to run on Android

Installing DeezLoader on Android is a little bit complicated but easy.<br/>
If you did installed DeezLoader and would like to just run it, go to step [5](https://github.com/Deezloader/DeezLoader-Reborn#5-run).

### How to update on Android

If you would like to update DeezLoader on android you need to first delete the folder

```
rm -rf DeezLoader-Reborn
```

Then follow from step [3](https://github.com/Deezloader/DeezLoader-Reborn#3-download)

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


To download the release version:
```
git clone  https://github.com/Deezloader/DeezLoader-Reborn
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
- Download the source code in the download section
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

# Changelogs
See changelogs [here](https://github.com/ivandelabeldad/deezloader-remaster/CHANGELOG)

# Credits
## Original Developers
[ZzMTV](https://boerse.to/members/zzmtv.3378614/)
[DeezLoader](https://t.me/joinchat/AAAAAFCRjRpUr-IF96RV3g)
[ExtendLord](https://github.com/ExtendLord)<br/>
[ParadoxalManiak](https://github.com/ParadoxalManiak)<br/>
[snwflake](https://github.com/snwflake)
[DeezLoader](https://t.me/joinchat/AAAAAFCRjRpUr-IF96RV3g)
## Former Maintainer
[ivandelabeldad](https://github.com/ivandelabeldad)

# Disclaimer
- I am not responsible for the usage of this program by other people.
- I do not recommend you doing this illegally or against Deezer's terms of service.
- This project is licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)
