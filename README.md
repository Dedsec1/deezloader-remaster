# DeezLoader Reborn V3.0.9
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
- Windows x64: [DeezLoader-3.0.9-win-64.exe](https://mega.nz/#!cJkiDSyS!FPFQPt5bHvcs89_tnMsTAe1f_YJJag8fRJO_v3uJEbw)
- Windows x86: [DeezLoader-3.0.9-win-32.exe](https://mega.nz/#!UQ9AxDjS!9ekWn_XN9G6NsCD9w2RwQveFwzV7rvYQpKERvpp6cuU)
- Linux x64: [DeezLoader-3.0.9-linux-64.AppImage](https://mega.nz/#!wBlmWaIC!56PKn6jcUe2NcHScvw-HlioezDpP_8xh9lm8tk9qtQM)
- Linux x86: [DeezLoader-3.0.9-linux-32.AppImage](https://mega.nz/#!MMFQmLSZ!l4BK2Xuoz1s6YtwzhM7il_Y4Bp5Dkz2xX4r6mEiVJ6g)
- Mac x64: [DeezLoader-3.0.9-mac-64.dmg](https://mega.nz/#!oZlz0IiZ!c07Ran7_zrrLaoNVyWQ-1Fbwb7Ow8r83zV25RP1gWQs)
- Older versions: [Releases](https://gitlab.com/ExtendLord/DeezLoader-Reborn/tags)
- Android: [Android installation guide](https://gitlab.com/ExtendLord/DeezLoader-Reborn#how-to-run-on-android)

# Virus total
- Windows x64: [DeezLoader-3.0.9-win-64.exe](https://www.virustotal.com/#/file/d92c42566fab232048da4d2daf070e3bf75c1ca1c16f78d0879dfc2e03db9e70)
- Windows x86: [DeezLoader-3.0.9-win-32.exe](https://www.virustotal.com/#/file/08ee100113db294823f6a6b9163b170bbf7a5ed774f5702875a6da14c0597a86)
- Linux x64: [DeezLoader-3.0.9-linux-64.AppImage](https://www.virustotal.com/#/file/b74de4d3f7897a29861a0c750ee739517767e0bda9be98f37751f9842022e9f0)
- Linux x86: [DeezLoader-3.0.9-linux-32.AppImage](https://www.virustotal.com/#/file/bea91e9914f65ee29ff744da3469fb070a95116ef207a166f861ac000d39468c)
- Mac x64: [DeezLoader-3.0.9-mac-64.dmg](https://www.virustotal.com/#/file/1717f5cb512d19ed138fa121b336f0ec980ac5fd173f094e1ff610b2e19835b3)

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
git clone --branch v3.0.9 https://gitlab.com/ExtendLord/DeezLoader-Reborn
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
