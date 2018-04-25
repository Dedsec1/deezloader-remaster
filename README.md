# DeezLoader Remaster V4.0.0 final
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

# Download Links (Old Versions)
- Source code: [DeezLoader-3.1.0-src.zip](https://github.com/Deezloader/DeezLoader-Reborn)
- Windows installer: [DeezLoader-3.1.0-win-64&32-installer.exe](https://mega.nz/#!qbgVCSIa!Lu4LgCGCe_BJsos__-eJ30JzpQh5v24KwI--9PBkGiQ)
- Windows x64 portable: [DeezLoader-3.1.0-win-64-portable.7z](https://mega.nz/#!SfYGVAgJ!tC4hP2k_3_uB1dSp19ro2wwLlw_vUoMeUhThFgLi2cc)
- Windows x86 portable: [DeezLoader-3.1.0-win-32-portable.7z](https://mega.nz/#!TChHWZJb!uqTi8nrKCnd9e1YAEJx6fftstTlBJMvlYfKINFBPwKA)
- Linux x64: [DeezLoader-3.1.0-linux-64.AppImage](https://mega.nz/#!qOIXmbZQ!d-6K5Lzgu23RHv5sA7-gKBGeNf70FbXIPNSQjiCZJPE)
- Linux x86: [DeezLoader-3.1.0-linux-32.AppImage](https://mega.nz/#!WOozwBTK!YxJdrxzlbY-IiTtKq3RIEfYX14d7CtQwsUrELBMoOUM)
- Mac x64: [DeezLoader-3.1.0-mac-64.dmg](https://mega.nz/#!LCpDlaQL!gcBFUhoG0XTigQGsfFDgWbBHYHC39LJtYVO8d3mL_qU)

# Virus total
- Windows installer: [DeezLoader-3.1.0-win-64&32-installer.exe](https://www.virustotal.com/#/file/5328d5b2a9e367c6db1d32d3649ea0b5ef6f36ece52d03efefb2afa2e0d323a1)
- Linux x64: [DeezLoader-3.1.0-linux-64.AppImage](https://www.virustotal.com/#/file/ad94225c5a429cdbeaa3be50fbc73c8b8164067f2e2b91cdb9095a1f26e57578)
- Linux x86: [DeezLoader-3.1.0-linux-32.AppImage](https://www.virustotal.com/#/file/9d7f7e00aba1d5fbf9c814270e5c57b5ac266d910d49f16ffdf43500113201ef)
- Mac x64: [DeezLoader-3.1.0-mac-64.dmg](https://www.virustotal.com/#/file/4ec7c4ac72ea7016fd920c69dfb7db5c4b35563ab77f0a5f6ab0adac8a7cdfb8)

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
```
Version 4.0.1
- Update regex to get user id
- Disable invalid API token

Version 4.0.0
- Change project name to DeezLoader Remaster
- Refactor css and js code and added cdns
- Update maintainers information
- Improved title bar
- Change pastebin version check

Version 3.3.0
- Add playlist converter by soundiiz

Version 3.2.0
- Add my playlists tab with the user public playlists

Version 3.1.0
-New repo on github
- Fixed Download Freeze
- Improved logs
- Improved UI
- Fixed album artwork size not being saved
- Fixed some typo
- Fixed synced lyrics for mp3
- Fixed Track fetching for unsupported countries

Version 3.0.15
- Added replaygain tag
- Added logout option
- Added signup option
- Added multi url support, seperated by ';'
- Fixed incomplete audio files
- Fixed track fallback(alternative property)(Deezer's API update)
- Improved logging system
- Improved pad numbers
- Removed init page since it is not used anymore

Version 3.0.14
- Login is required due to Deezer's patch(Crashes when downloading anything)
- Added BPM tag

Version 3.0.13
- Fixed timeout of the download system
- Fixed images for tracks
- Fixed and Improved MP3 tags
- Added %type%(Record type) for album name format

Version 3.0.12
- Added request retry, connections will retry if fail
- Added record type to the search section(Results of Albums and Artists albums)
- Fixed dots at end of playlists
- Fixed download freezes (metadata image issues)
- Removed the title bar from the web GUI
- Improved download speed and decryption system

Version 3.0.11
- Fixed artwork duplicate for two tracks with the same name
- Added tags: mixer, author, writer, engineer and producer
- Fixed copyright tag when it is not available
- Removed performer tag from FLAC
- Removed label tag and changed from track date to album/ep/single date tag
- Restored decrypting system due to mp3 being corrupt
- Fixed crash when downloading a track with album folder enabled

Version 3.0.10
- Improved downloading and decrypting system
- Improved update notifier
- Added 1400p artworks
- Alternative tracks will take the original tracks tag if possible
- Removed Disc folders, tracks of albums with discs will be combined into one.
- Removed 'dev' from the update notifier
- Artist folders are now named by the artist of the albums
- Fixed album name option when artist option is checked
- Fixed android's home location(It had two slashes)
- Fixed default android path
- Fixed album's %year%
- Fixed downloading issues for non supported countries
- Fixed ENOENT crashes caused by queues
- Fixed a minor bug in the alternative track code
- Added a backup server for update notifier

Version 3.0.9
- Added synced and unsynced lyrics, album name option and number playlist by album option
- Added pad track number(01,02)
- Fixed dots at end of folders when album/arist folder is enabled
- Fixed ENOENT when folder does not exists
- Fixed alternative track downloading, it will only download it if it will fail to download the non alternative one
- Changed license to GNU GPL 3.0
- Changed all spaces in the JS code to tabs
- Improved update notifier, it will redirect you to the download page

Version 3.0.8
- Fixed initializing stuck
- Removed Diacritics remover
- Changed name fixer
- Added barcode for FLAC
- Added support for Android
- Added web server http://localhost:1730
- Updated libraries

Version 3.0.7
- Fixed crash when composer or publisher tag is not available
- Added version to the update notifier

Version 3.0.6
- Login page will only appear for those who need it
- Added composer, publisher and copyright tag
- Fixed the issue that only the first album would be clickable from an artist
- Fixed crash when no internet in the login page

Version 3.0.5
- Changed repo from github to gitlab
- Fixed Login error for Deezer Family Accounts
- Fixed composer tag

Version 3.0.4
- Fixed download crashes
- Fixed failed tracks when downloading some albums and playlists
- Fixed folder does not exists crash
- Improved tags
- Changed album cover dir to the albums folder
- Changed settings style
- Fixed login crash when there is no connection

Version 3.0.3
- Added auto login
- Added MP3 Fallback
- Added auto update
- Fixed login error not being triggered sometimes

Version 3.0.2
- Fixed crashes when songs could not be downloaded
- Added bpm tag
- Added logging system(Fixed same song downloading and some songs not being available)
- Fixed corruped FLAC's
- Added %year%
- Fixed dots at end
- Fixed undefined genre

Version 3.0.1
- Added a couple of tags
- Fixed minor bugs
- Removed tag libs, a moudle is used instead

Version 3.0.0
- Added Vorbis comments(To support FLAC tagging)
- Added HIFI(FLAC) quality (Opt-IN in settings)
- Updated http to https
- Updated all libraries to their latest version
- Fixed random crash when searching
- Fixed the track info grabber(Downloading was not possible)
- Fixed artist duplicate in tagging
- Changed the default artwork size to 1200p
- Changed config location to UserData folder(Appdata)

Version 2.3.1
- Fixed the %number% variable to only list the current track
- Fixed the resolution for users with a screensize less than 1400x900p
- Fixed folder/file creation name for windows (...again...)
- Fixed explicit tooltip
- Added more logging
- Added progress bar support for artists
- Added a checkbox to select everything in album/playlist-modal
- Added tooltip for supported naming patterns
- Added an option to select a different artwork size. (500p, 800p(default), 1000p, 1200p)
- Enhanced tagging, now all artists are written to the 'artist'-field

Version 2.3.0
- Fixed app refusing to start when some folders are missing
- Fixed playlist file not containing the correct file names
- Fixed folders with a dot at the end resulting in undeletable file
- Fixed the progress bar for albums and playlists
- Relocated explicit icon to the front of the filename
- Added more explicit icons in album-/playlist- and artist-modal
- Added a new feature which allow the user to only download selected song from an album or playlist

Version 2.2.1
- Fixed settings module (sigh ... again)
- Fixed issue related to folders that have special chars

Version 2.2.0
- Fixed settings panel, all settings should work as expected now
- Fixed writing location of config.json
- Fixed crashing when searching for cyrillic characters, it should work fine now
- Moved the folder for cover arts to the temp folder of the system
- Added icon for explicit songs
- The window size and position are now remembered
- The "Scroll to top" button works again
- Fixed problem with folders that contain dots and other symbols
- A bunch of refactoring thanks to Blind-Mute
- Fixed cover art not embedding on OSX
- Minor performance improvements

Version 2.1.2
- Fixed Deezer API connection
- Fixed tracks metadata naming for diacritics text
- Added custom location for downloads settings

Version 2.1.1
- Added context menu
- Corrected some spelling mistakes
- Fixed crash when searching with special characters like Æ, Ø and Å.

Version 2.1.0
- Updated all libraries to their latest version (this should fix issues with newer node versions)
- Updated the design of the app, checked spelling and added responsive so it can be better used on a mobile browser.
- Fixed small bug with overlapping texts in settings modal
- Fixed clear button in the downloads section not working
- Added error logging

Version 2.0.3
- Removed the updater to stop spamming the domain of the original author
- Removed character fixing in metadata that would result in AC/DC being turned to AC_DC.
- Fixed the Artist's album list not being loaded. Now it loads and has the option to download the album.
- Changed the default country in top charts to UK instead of Germany (not a feature, just a thing I did when I was
tinkering with the code and forgot to change)
- Fixed compatibility issues with Node v6 (works on older versions too, but there might be problems with downloading
the cover art, so please update to v6 if you can)
```

# Credits
## Original Developer
[ZzMTV](https://boerse.to/members/zzmtv.3378614/)
[DeezLoader](https://t.me/joinchat/AAAAAFCRjRpUr-IF96RV3g)
## Former Maintainers
[ExtendLord](https://github.com/ExtendLord)<br/>
[ParadoxalManiak](https://github.com/ParadoxalManiak)<br/>
[snwflake](https://github.com/snwflake)
[DeezLoader](https://t.me/joinchat/AAAAAFCRjRpUr-IF96RV3g)

**No longer maintained by ExtendLord**
[DeezLoader](https://t.me/joinchat/AAAAAFCRjRpUr-IF96RV3g)

# Disclaimer
- I am not responsible for the usage of this program by other people.
- I do not recommend you doing this illegally or against Deezer's terms of service.
- This project is licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)
