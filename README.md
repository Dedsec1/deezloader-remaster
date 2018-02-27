# DeezLoader Reborn V3.0.12
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
- Windows x64: [DeezLoader-3.0.12-win-64.exe](https://mega.nz/#!oM8wUShL!2Gq7H8B49n5x8DB7ho1vtdNJCevUtPbtX0dIFvUhvTY)
- Windows x86: [DeezLoader-3.0.12-win-32.exe](https://mega.nz/#!hN9g0AIS!XlIEFMZ_yp_NZ9EFchKTmHcaoDJijtWbV3Qg0iXmusc)
- Linux x64: [DeezLoader-3.0.12-linux-64.AppImage](https://mega.nz/#!4UdlkSRC!ZclrGftp_wdDVPtzdUhp1IdvldPrvGa-RKU7aJcmlM0)
- Linux x86: [DeezLoader-3.0.12-linux-32.AppImage](https://mega.nz/#!Vc0igDAZ!-dJ8MVVPd1HM24r8Ez88tjk9l0GTMcvOtBA4AwsUTuw)
- Mac x64: [DeezLoader-3.0.12-mac-64.dmg](https://mega.nz/#!FIFQWTBT!kUjJjaKuLNJP3eUY4OIQxX-bFr2Qp7q63LgNnJjwOTw)
- Older versions: [Releases](https://gitlab.com/ExtendLord/DeezLoader-Reborn/tags)
- Android: [Android installation guide](https://gitlab.com/ExtendLord/DeezLoader-Reborn#how-to-run-on-android)

# Virus total
- Windows x64: [DeezLoader-3.0.12-win-64.exe](https://www.virustotal.com/#/file/8e018fa7a00f2639d0409d18adab4cef4caacdd20d54309b62e3fa224659c715)
- Windows x86: [DeezLoader-3.0.12-win-32.exe](https://www.virustotal.com/#/file/2e89ca5c9ba4e913bee2654bcb73518b0377fad1bf15eb1d5ca7637ee1ae0f2b)
- Linux x64: [DeezLoader-3.0.12-linux-64.AppImage](https://www.virustotal.com/#/file/ed9596d22a29b6217c7f59b5ab2a0133a2244904dcb918f1445010d16f0a330d)
- Linux x86: [DeezLoader-3.0.12-linux-32.AppImage](https://www.virustotal.com/#/file/7188b374590a4a8fc29f10d0c35f22972e0ad25c6b9f450cbac78d8e9623da06)
- Mac x64: [DeezLoader-3.0.12-mac-64.dmg](https://www.virustotal.com/#/file/95c0ddad2dae34e52abc2df5b511cc6831eea70309818dc9d8e1d2a0fe6a128c)

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
git clone --branch v3.0.12 https://gitlab.com/ExtendLord/DeezLoader-Reborn
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
