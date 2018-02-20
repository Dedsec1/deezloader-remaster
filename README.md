# DeezLoader Reborn V3.0.10
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
- Windows x64: [DeezLoader-3.0.10-win-64.exe](https://mega.nz/#!FVFj0RxR!KEIhVVwZWBAbjCC0Ezr6gqySR2n3QhdDtX9_ulITQAM)
- Windows x86: [DeezLoader-3.0.10-win-32.exe](https://mega.nz/#!FRVhyRbY!aWy_sEc8C8odJdxOruPw0qcVsdy7hvUyiQmdflONDjA)
- Linux x64: [DeezLoader-3.0.10-linux-64.AppImage](https://mega.nz/#!JAFUzC4A!w6NpmsjB9sMiK5b5FQjTycwKhsCVTsbi5mqay2gK5MQ)
- Linux x86: [DeezLoader-3.0.10-linux-32.AppImage](https://mega.nz/#!1Q1ShbTA!max8HLvo_abOsP4XQglROQJXc9BYNTTB7SfXnIzEbp8)
- Mac x64: [DeezLoader-3.0.10-mac-64.dmg](https://mega.nz/#!5cFThQ5C!6K1-NkiLsRwirIBqzT0gM6mxlDI09iID2BGcwS2hpOA)
- Older versions: [Releases](https://gitlab.com/ExtendLord/DeezLoader-Reborn/tags)
- Android: [Android installation guide](https://gitlab.com/ExtendLord/DeezLoader-Reborn#how-to-run-on-android)

# Virus total
- Windows x64: [DeezLoader-3.0.10-win-64.exe](https://www.virustotal.com/#/file/424d918665dfa081f65050368b50fc116364d105515fd197afdc6f689d067a8c)
- Windows x86: [DeezLoader-3.0.10-win-32.exe](https://www.virustotal.com/#/file/012f3fda4690f9e462771c0237f12463eebcaeec6beb845f067cc6c653a2a927)
- Linux x64: [DeezLoader-3.0.10-linux-64.AppImage](https://www.virustotal.com/#/file/4834f0bb2b06f0fbb72417e4c1bdc214e493cd26ec3e454d896af5730585035c)
- Linux x86: [DeezLoader-3.0.10-linux-32.AppImage](https://www.virustotal.com/#/file/d79d7d5ff0f628dd009fa5d5e52e88b834912789c5076614b68de3eb8894b8d8)
- Mac x64: [DeezLoader-3.0.10-mac-64.dmg](https://www.virustotal.com/#/file/c1db955ce2c46a16b494dd240eaaae23c3ccc87dd6f4aea95e6e664d8122a68a)

# Donations
- **BTC/BCH:** 1A25gu2vMXLfQBYArYLMBcTpnuwPiKW6vL
- **LTC:** LbrVLYkmJ3k2woXACMKshg8KqbMqt1yhAz
- **Paypal:** extendlord@gmail.com

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
git clone --branch v3.0.10 https://gitlab.com/ExtendLord/DeezLoader-Reborn
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
