/*
 *  _____                    _                    _
 * |  __ \                  | |                  | |
 * | |  | |  ___   ___  ____| |  ___    __ _   __| |  ___  _ __
 * | |  | | / _ \ / _ \|_  /| | / _ \  / _` | / _` | / _ \| '__|
 * | |__| ||  __/|  __/ / / | || (_) || (_| || (_| ||  __/| |
 * |_____/  \___| \___|/___||_| \___/  \__,_| \__,_| \___||_|
 *
 *
 *
 *  Maintained by ExtendLord <https://www.reddit.com/user/ExtendLord/>
 *  Original work by ZzMTV <https://boerse.to/members/zzmtv.3378614/>
 * */

const winston = require('winston');
const electron = require('electron');
const electronApp = electron.app;
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const https = require('https');
const mflac = require('flac-metadata');
const io = require('socket.io').listen(server, {log: false});
const fs = require('fs-extra');
const async = require('async');
const request = require('request');
const os = require('os');
const nodeID3 = require('node-id3');
const Deezer = require('./deezer-api');
const packagejson = require('./package.json');
const mkdirp = require('mkdirp');
const path = require('path');
const crypto = require('crypto');
let configFile = require(electronApp.getPath("userData")+path.sep+"config.json");

// Main Constants
const configFileLocation = electronApp.getPath("userData")+path.sep+"config.json";
const autologinLocation = electronApp.getPath("userData")+path.sep+"autologin";
const coverArtFolder = electronApp.getPath('temp') + path.sep + 'deezloader-imgs' + path.sep;
const defaultDownloadDir = electronApp.getPath('music') + path.sep + 'Deezloader' + path.sep;
const triesToConnect = 30;
const defaultSettings = {
    "trackNameTemplate": "%artist% - %title%",
    "playlistTrackNameTemplate": "%number% - %artist% - %title%",
    "createM3UFile": false,
    "createArtistFolder": false,
    "createAlbumFolder": false,
    "downloadLocation": null,
    "artworkSize": "/1200x1200.jpg",
    "hifi": false
};



// Setup error logging
// fileTransport
winston.add(winston.transports.File, {
    filename: __dirname + path.sep +'deezloader.log',
    handleExceptions: true,
    humanReadableUnhandledException: true
});

// Setup the folders START
let mainFolder = defaultDownloadDir;

if (configFile.userDefined.downloadLocation != null) {
    mainFolder = configFile.userDefined.downloadLocation;
}

initFolders();
// END

// Route and Create server
app.use('/', express.static(__dirname + '/public/'));
server.listen(configFile.serverPort);
console.log('Server is running @ localhost:' + configFile.serverPort);

//Autologin encryption/decryption

var ekey = "DeezLadRebExtLrdDeezLadRebExtLrd";

function alencrypt(input) {
    var iv = crypto.randomBytes(16);

    var data = new Buffer(input).toString('binary');
        
    key = new Buffer(ekey, "utf8");
    var cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    var encrypted;

    encrypted =  cipher.update(data, 'utf8', 'binary') +  cipher.final('binary');
    var encoded = new Buffer(iv, 'binary').toString('hex') + new Buffer(encrypted, 'binary').toString('hex');

    return encoded;
}

function aldecrypt(encoded) {  
    var combined = new Buffer(encoded, 'hex');      

    key = new Buffer(ekey, "utf8");
    
    // Create iv
    var iv = new Buffer(16);
    
    combined.copy(iv, 0, 0, 16);
    edata = combined.slice(16).toString('binary');
    // Decipher encrypted data
    var decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    var decrypted, plaintext;
    
    plaintext = (decipher.update(edata, 'binary', 'utf8') + decipher.final('utf8'));

    return plaintext;
}

// START sockets clusterfuck
io.sockets.on('connection', function (socket) {
    socket.downloadQueue = [];
    socket.currentItem = null;
    socket.lastQueueId = null;
    request.get("https://raw.githubusercontent.com/ExtendLord/DeezLoader-Reborn/master/VERSION.md", function (error, response, body) {
        if(!error && response.statusCode == 200){
            if(body.split("\n")[0] != packagejson.version){
                socket.emit("newupdate");
            }
        }else{
            console.log(error);
        }
    });
    socket.on("checkInit", function (username, password, autologin) {
        Deezer.init(username, password, function (err) {
            if(err){
                socket.emit("checkInit", err.message);
            }else{
                if(autologin){
                    var data = username + "\n" + password;
                    fs.writeFile(autologinLocation, alencrypt(data) , function(){
                    });
                }
                socket.emit("checkInit", "none");
            }
        });
    });

    socket.on("autologin", function(){
        fs.readFile(autologinLocation, function(err, data){
            if(err){
                return;
            }
            try{
                var fdata = aldecrypt(data.toString('utf8'));
            }catch(e){
                console.log("Failed to decrypt autologin, deleting");
                fs.unlink(autologinLocation,function(){
                });
                return;
            }
            fdata = fdata.split('\n');
            socket.emit("autologin",fdata[0],fdata[1]);
        });
    });

    Deezer.onDownloadProgress = function (track, progress) {
        if (!track.trackSocket) {
            return;
        }

        if(track.trackSocket.currentItem.type == "track"){
            let complete;
            if (!track.trackSocket.currentItem.percentage) {
                track.trackSocket.currentItem.percentage = 0;
            }
            if(configFile.userDefined.hifi){
                complete = track.FILESIZE_FLAC;
            }else{
                if (track.FILESIZE_MP3_320) {
                    complete = track.FILESIZE_MP3_320;
                } else if (track.FILESIZE_MP3_256) {
                    complete = track.FILESIZE_MP3_256;
                } else {
                    complete = track.FILESIZE_MP3_128 || 0;
                }
            }

            let percentage = (progress / complete) * 100;

            if ((percentage - track.trackSocket.currentItem.percentage > 1) || (progress == complete)) {
                track.trackSocket.currentItem.percentage = percentage;
                track.trackSocket.emit("downloadProgress", {
                    queueId: track.trackSocket.currentItem.queueId,
                    percentage: track.trackSocket.currentItem.percentage
                });
            }
        }
        else if(track.trackSocket.currentItem.type == "album"){
            let numTracks = track.trackSocket.currentItem.size;
            let downloaded = track.trackSocket.currentItem.downloaded;

            let percentage = (downloaded / (numTracks)) * 100;
            track.trackSocket.emit("downloadProgress", {
                queueId: track.trackSocket.currentItem.queueId,
                percentage: percentage
            });
        }
    };

    function addToQueue(object) {
        socket.downloadQueue.push(object);
        socket.emit('addToQueue', object);

        queueDownload(getNextDownload());
    }

    function getNextDownload() {
        if (socket.currentItem != null || socket.downloadQueue.length == 0) {
            if (socket.downloadQueue.length == 0 && socket.currentItem == null) {
                socket.emit("emptyDownloadQueue", {});
            }
            return null;
        }
        socket.currentItem = socket.downloadQueue[0];
        return socket.currentItem;
    }

    //currentItem: the current item being downloaded at that moment such as a track or an album
    //downloadQueue: the tracks in the queue to be downloaded
    //lastQueueId: the most recent queueID
    //queueId: random number generated when user clicks download on something
    function queueDownload(downloading) {
        if (!downloading) return;

        // New batch emits new message
        if (socket.lastQueueId != downloading.queueId) {
            socket.emit("downloadStarted", {queueId: downloading.queueId});
            socket.lastQueueId = downloading.queueId;
        }

        if (downloading.type == "track") {
            downloadTrack(downloading.id, downloading.settings, function (err) {
                if (err) {
                    downloading.failed++;
                } else {
                    downloading.downloaded++;
                }
                socket.emit("updateQueue", downloading);
                if (socket.downloadQueue[0] && (socket.downloadQueue[0].queueId == downloading.queueId)) {
                    socket.downloadQueue.shift();
                }
                socket.currentItem = null;
                //fs.rmdirSync(coverArtDir);
                queueDownload(getNextDownload());
            });
        } else if (downloading.type == "playlist") {
            Deezer.getPlaylistTracks(downloading.id, function (tracks, err) {
                downloading.playlistContent = tracks.data.map((t) => {
                    return t.id
                });
                downloading.settings.addToPath = antiDot(downloading.name);
                async.eachSeries(downloading.playlistContent, function (id, callback) {
                    if (downloading.cancelFlag) {
                        callback("stop");
                        return;
                    }
                    downloading.settings.playlist = {
                        position: downloading.playlistContent.indexOf(id),
                        fullSize: downloading.playlistContent.length
                    };
                    downloadTrack(id, downloading.settings, function (err) {
                        if (!err) {
                            downloading.downloaded++;
                        } else {
                            winston.log('error', 'error', err);
                            downloading.failed++;
                        }
                        socket.emit("updateQueue", downloading);
                        callback();
                    });
                }, function (err) {
                    console.log("Playlist finished: " + downloading.name);
                    if(typeof socket.downloadQueue[0] != 'undefined'){
                        socket.emit("downloadProgress", {
                            queueId: socket.downloadQueue[0].queueId,
                            percentage: 100
                        });
                    }
                    if (downloading && socket.downloadQueue[0] && socket.downloadQueue[0].queueId == downloading.queueId) socket.downloadQueue.shift();
                    socket.currentItem = null;
                    //fs.rmdirSync(coverArtDir);
                    queueDownload(getNextDownload());
                });
            });
        } else if (downloading.type == "album") {
            Deezer.getAlbumTracks(downloading.id, function (tracks, err) {
                downloading.playlistContent = tracks.data.map((t) => {
                    return t.id
                });
                downloading.settings.tagPosition = true;
                downloading.settings.addToPath = downloading.artist + " - " + antiDot(downloading.name);
                async.eachSeries(downloading.playlistContent, function (id, callback) {
                    if (downloading.cancelFlag) {
                        callback("stop");
                        return;
                    }
                    downloading.settings.playlist = {
                        position: downloading.playlistContent.indexOf(id),
                        fullSize: downloading.playlistContent.length
                    };
                    downloadTrack(id, downloading.settings, function (err) {
                        // if (downloading.countPerAlbum) {
                        //     winston.log('error', 'SUCK MY BALLZ!');
                        //     callback();
                        //     return;
                        // }
                        if (!err) {
                            downloading.downloaded++;
                        } else {

                            downloading.failed++;
                        }
                        socket.emit("updateQueue", downloading);
                        callback();
                    });
                }, function (err) {
                    if (downloading.countPerAlbum) {
                        if (socket.downloadQueue.length > 1 && socket.downloadQueue[1].queueId == downloading.queueId) {
                            socket.downloadQueue[1].download = downloading.downloaded;
                        }
                        socket.emit("updateQueue", downloading);
                    }
                    console.log("Album finished: " + downloading.name);
                    if(typeof socket.downloadQueue[0] != 'undefined'){
                        socket.emit("downloadProgress", {
                            queueId: socket.downloadQueue[0].queueId,
                            percentage: 100
                        });
                    }
                    if (downloading && socket.downloadQueue[0] && socket.downloadQueue[0].queueId == downloading.queueId) socket.downloadQueue.shift();
                    socket.currentItem = null;
                    //fs.rmdirSync(coverArtDir);
                    queueDownload(getNextDownload());
                });
            });
        }
    }

    socket.on("downloadtrack", function (data) {
        Deezer.getTrack(data.id, function (track, err) {
            if (err) {
                winston.log('error', 'error', err);
                return;
            }
            let queueId = "id" + Math.random().toString(36).substring(2);
            let _track = {
                name: track["SNG_TITLE"],
                size: 1,
                downloaded: 0,
                failed: 0,
                queueId: queueId,
                id: track["SNG_ID"],
                type: "track"
            };
            if (track["VERSION"]) _track.name = _track.name + " " + track["VERSION"];
            _track.settings = data.settings || {};
            addToQueue(_track);
        });
    });

    socket.on("downloadplaylist", function (data) {
        Deezer.getPlaylist(data.id, function (playlist, err) {
            if (err) {
                winston.log('error', 'error', err);
                return;
            }
            Deezer.getPlaylistSize(data.id, function (size, err) {
                if (err) {
                    winston.log('error', 'error', err);
                    return;
                }
                let queueId = "id" + Math.random().toString(36).substring(2);
                let _playlist = {
                    name: playlist["title"],
                    size: size,
                    downloaded: 0,
                    failed: 0,
                    queueId: queueId,
                    id: playlist["id"],
                    type: "playlist"
                };
                _playlist.settings = data.settings || {};
                addToQueue(_playlist);
            });
        });
    });

    socket.on("downloadalbum", function (data) {
        Deezer.getAlbum(data.id, function (album, err) {
            if (err) {
                winston.log('error', 'error', err);
                return;
            }
            Deezer.getAlbumSize(data.id, function (size, err) {
                if (err) {
                    winston.log('error', 'error', err);
                    return;
                }
                let queueId = "id" + Math.random().toString(36).substring(2);
                let _album = {
                    name: album["title"],
                    label: album["label"],
                    artist: album["artist"].name,
                    size: size,
                    downloaded: 0,
                    failed: 0,
                    queueId: queueId,
                    id: album["id"],
                    type: "album"
                };
                _album.settings = data.settings || {};
                addToQueue(_album);
            });
        });
    });

    socket.on("downloadartist", function (data) {
        Deezer.getArtist(data.id, function (artist, err) {
            if (err) {
                winston.log('error', 'error', err);
                return;
            }
            Deezer.getArtistAlbums(data.id, function (albums, err) {
                if (err) {
                    winston.log('error', 'error', err);
                    return;
                }
                for (let i = 0; i < albums.data.length; i++) {
                    Deezer.getAlbumSize(albums.data[i].id, function(size, err){
                        if(err) {
                          winston.log('error', 'error', err);
                          return;
                        }
                        let queueId = "id" + Math.random().toString(36).substring(2);
                        let album = albums.data[i];
                        let _album = {
                            name: album["title"],
                            artist: artist.name,
                            size: size,
                            downloaded: 0,
                            failed: 0,
                            queueId: queueId,
                            id: album["id"],
                            type: "album",
                            countPerAlbum: true
                        };
                        _album.settings = data.settings || {};
                        addToQueue(_album);
                    });
                }
            });
        });
    });

    socket.on("getChartsTopCountry", function () {
        Deezer.getChartsTopCountry(function (charts, err) {
            charts = charts || {};
            if (err) {
                charts.data = [];
            }
            socket.emit("getChartsTopCountry", {charts: charts.data, err: err});
        });
    });

    socket.on("getChartsCountryList", function (data) {
        Deezer.getChartsTopCountry(function (charts, err) {
            charts = charts.data || [];
            let countries = [];
            for (let i = 0; i < charts.length; i++) {
                let obj = {
                    country: charts[i].title.replace("Top ", ""),
                    picture_small: charts[i].picture_small,
                    picture_medium: charts[i].picture_medium,
                    picture_big: charts[i].picture_big
                };
                countries.push(obj);
            }
            socket.emit("getChartsCountryList", {countries: countries, selected: data.selected});
        });
    });

    socket.on("getChartsTrackListByCountry", function (data) {
        if (!data.country) {
            socket.emit("getChartsTrackListByCountry", {err: "No country passed"});
            return;
        }

        Deezer.getChartsTopCountry(function (charts, err) {
            charts = charts.data || [];
            let countries = [];
            for (let i = 0; i < charts.length; i++) {
                countries.push(charts[i].title.replace("Top ", ""));
            }

            if (countries.indexOf(data.country) == -1) {
                socket.emit("getChartsTrackListByCountry", {err: "Country not found"});
                return;
            }

            let playlistId = charts[countries.indexOf(data.country)].id;

            Deezer.getPlaylistTracks(playlistId, function (tracks, err) {
                if (err) {
                    socket.emit("getChartsTrackListByCountry", {err: err});
                    return;
                }
                socket.emit("getChartsTrackListByCountry", {
                    playlist: charts[countries.indexOf(data.country)],
                    tracks: tracks.data
                });
            });
        });
    });

    socket.on("search", function (data) {
        data.type = data.type || "track";
        if (["track", "playlist", "album", "artist"].indexOf(data.type) == -1) {
            data.type = "track";
        }

        Deezer.search(encodeURIComponent(data.text), data.type, function (searchObject, err) {
            try {
                socket.emit("search", {type: data.type, items: searchObject.data});
            } catch (e) {
                socket.emit("search", {type: data.type, items: []});
            }
        });
    });

    socket.on("getInformation", function (data) {
        if (!data.type || (["track", "playlist", "album", "artist"].indexOf(data.type) == -1) || !data.id) {
            socket.emit("getInformation", {err: -1, response: {}, id: data.id});
            return;
        }

        let reqType = data.type.charAt(0).toUpperCase() + data.type.slice(1);

        Deezer["get" + reqType](data.id, function (response, err) {
            if (err) {
                socket.emit("getInformation", {err: "wrong id", response: {}, id: data.id});
                return;
            }
            socket.emit("getInformation", {response: response, id: data.id});
        });
    });

    socket.on("getTrackList", function (data) {
        if (!data.type || (["playlist", "album", "artist"].indexOf(data.type) == -1) || !data.id) {
            socket.emit("getTrackList", {err: -1, response: {}, id: data.id, reqType: data.type});
            return;
        }

        if (data.type == 'artist') {
            Deezer.getArtistAlbums(data.id, function (response, err) {
                if (err) {
                    socket.emit("getTrackList", {err: "wrong id", response: {}, id: data.id, reqType: data.type});
                    return;
                }
                socket.emit("getTrackList", {response: response, id: data.id, reqType: data.type});
            });
        } else {
            let reqType = data.type.charAt(0).toUpperCase() + data.type.slice(1);

            Deezer["get" + reqType + "Tracks"](data.id, function (response, err) {
                if (err) {
                    socket.emit("getTrackList", {err: "wrong id", response: {}, id: data.id, reqType: data.type});
                    return;
                }
                socket.emit("getTrackList", {response: response, id: data.id, reqType: data.type});
            });
        }

    });

    socket.on("cancelDownload", function (data) {
        if (!data.queueId) {
            return;
        }

        let cancel = false;
        let cancelSuccess;

        for (let i = 0; i < socket.downloadQueue.length; i++) {
            if (data.queueId == socket.downloadQueue[i].queueId) {
                socket.downloadQueue.splice(i, 1);
                i--;
                cancel = true;
            }
        }

        if (socket.currentItem && socket.currentItem.queueId == data.queueId) {
            cancelSuccess = Deezer.cancelDecryptTrack();
            cancel = cancel || cancelSuccess;
        }


        if (cancelSuccess && socket.currentItem) {
            socket.currentItem.cancelFlag = true;
        }
        if (cancel) {
            socket.emit("cancelDownload", {queueId: data.queueId});
        }
    });

    socket.on("downloadAlreadyInQueue", function (data) {
        if (data.id) {
            return;
        }
        let isInQueue = checkIfAlreadyInQueue(data.id);
        if (isInQueue) {
            socket.emit("downloadAlreadyInQueue", {alreadyInQueue: true, id: data.id, queueId: isInQueue});
        } else {
            socket.emit("downloadAlreadyInQueue", {alreadyInQueue: false, id: data.id});
        }
    });

    socket.on("getUserSettings", function () {
        let settings = configFile.userDefined;
        if (!settings.downloadLocation) {
            settings.downloadLocation = mainFolder;
        }

        socket.emit('getUserSettings', {settings: settings});
    });

    socket.on("saveSettings", function (settings) {
        if (settings.userDefined.downloadLocation == defaultDownloadDir) {
            settings.userDefined.downloadLocation = null;
        } else {
            settings.userDefined.downloadLocation = path.resolve(settings.userDefined.downloadLocation + path.sep) + path.sep;
            mainFolder = settings.userDefined.downloadLocation;
        }

        configFile.userDefined = settings.userDefined;
        fs.writeFile(configFileLocation, JSON.stringify(configFile, null, 2), function (err) {
            if (err) return winston.log('error', 'error', err);
            console.log('Settings Updated');
            initFolders();
        });
    });

    function downloadTrack(id, settings, callback) {
        Deezer.getTrack(id, function (track, err) {
            if (err) {
                callback(err);
                return;
            }

            Deezer.getAlbum(track["ALB_ID"], function(res){
                if(!res){
                    callback(new Error("Album does not exists."));
                    return;
                }
                Deezer.getATrack(res.tracks.data[res.tracks.data.length - 1].id, function(tres){
                    track.trackSocket = socket;

                    settings = settings || {};
                    // winston.log('debug', 'TRACK:', track);
                    if (track["VERSION"]) track["SNG_TITLE"] += " " + track["VERSION"];
                    var ajson = res;
                    var tjson = tres;
                    let metadata = {
                        title: removeDiacritics(track["SNG_TITLE"]),
                        artist: removeDiacritics(track["ART_NAME"]),
                        album: removeDiacritics(track["ALB_TITLE"]),
                        performerInfo: ajson.artist.name,
                        trackNumber: track["TRACK_NUMBER"],
                        partOfSet: track["DISK_NUMBER"],
                        label: ajson.label,
                        ISRC: track["ISRC"],
                        duration: track["DURATION"],
                        explicit: track["EXPLICIT_LYRICS"]
                    };
                    if (0 < parseInt(track["BPM"])) {
                        metadata.bpm = track["BPM"];
                    }
                    if(ajson.genres && ajson.genres.data[0] && ajson.genres.data[0].name){
                        metadata.genre = ajson.genres.data[0].name;
                    }

                    if (track["ALB_PICTURE"]) {
                        metadata.image = Deezer.albumPicturesHost + track["ALB_PICTURE"] + settings.artworkSize;
                    }

                    if (track["PHYSICAL_RELEASE_DATE"]) {
                        metadata.year = track["PHYSICAL_RELEASE_DATE"].slice(0, 4);
                    }
                    let filename = `${metadata.artist} - ${metadata.title}`;
                    if (settings.filename) {
                        filename = settingsRegex(metadata, settings.filename, settings.playlist);
                    }

                    let filepath = mainFolder;
                    if (settings.createArtistFolder || settings.createAlbumFolder) {
                        if (settings.createArtistFolder) {
                            filepath += fixName(metadata.artist, false) + path.sep;
                            if (!fs.existsSync(filepath)) {
                                fs.mkdirSync(filepath);
                            }
                        }

                        if (settings.createAlbumFolder) {
                            filepath += fixName(settings.createArtistFolder ? metadata.album : `${metadata.artist} - ${metadata.album}`, false) + path.sep;
                            if (!fs.existsSync(filepath)) {
                                fs.mkdirSync(filepath);
                            }
                        }
                    } else if (settings.addToPath) {
                        filepath += fixName(settings.addToPath, true) + path.sep;
                    }


                    fs.ensureDirSync(filepath);

                    let writePath;
                    if(track.format == 9){
                        writePath = filepath + fixName(filename, true) + '.flac';
                    }else{
                        writePath = filepath + fixName(filename, true) + '.mp3';
                    }

                    console.log('Downloading file to ' + writePath);

                    if (fs.existsSync(writePath)) {
                        console.log("Already downloaded: " + metadata.artist + ' - ' + metadata.title);
                        callback();
                        return;
                    }

                    //Get image
                    if (metadata.image) {
                        let imgPath = coverArtFolder + fixName(metadata.title, true) + ".jpg";
                        let imagefile = fs.createWriteStream(imgPath);
                        https.get(metadata.image, function (response) {
                            if (!response) {
                                metadata.image = undefined;
                                return;
                            }
                            response.pipe(imagefile);
                            metadata.image = (imgPath).replace(/\\/g, "/");
                        });
                    }

                    Deezer.decryptTrack(track, function (buffer, err) {
                        if (err && err.message == "aborted") {
                            socket.currentItem.cancelFlag = true;
                            callback();
                            return;
                        }
                        if (err) {
                            Deezer.hasTrackAlternative(id, function (alternative, err) {
                                if (err || !alternative) {
                                    console.log("Failed to download: " + metadata.artist + " - " + metadata.title);
                                    callback(err);
                                    return;
                                }
                                downloadTrack(alternative.id, settings, callback);
                            });
                            return;
                        }
                        var tempPath = writePath;
                        if(track.format == 9){
                        	tempPath = writePath+".temp";
                        }
                        fs.writeFile(tempPath, buffer, function (err) {
                            if (err) {
                                console.log("Failed to download: " + metadata.artist + " - " + metadata.title);
                                callback(err);
                                return;
                            }

                            if (settings.createM3UFile && settings.playlist) {
                                if(track.format == 9){
                                    fs.appendFileSync(filepath + "playlist.m3u", fixName(filename,true) + ".flac\r\n");
                                }else{
                                    fs.appendFileSync(filepath + "playlist.m3u", fixName(filename,true) + ".mp3\r\n");
                                }
                            }

                            console.log("Downloaded: " + metadata.artist + " - " + metadata.title);
                            metadata.artist = '';
                            var first = true;
                            track['ARTISTS'].forEach(function(artist){
                                if(first){
                                    metadata.artist = artist['ART_NAME'];
                                    first = false;
                                } else{
                                    if(metadata.artist.indexOf(artist['ART_NAME']) == -1)
                                        metadata.artist += ', ' + artist['ART_NAME'];
                                }
                            });

                            if(track.format == 9){
                                let flacComments = [
                                    'TITLE=' + metadata.title,
                                    'ALBUM=' + metadata.album,
                                    'PERFORMER=' + metadata.performerInfo,
                                    'ALBUMARTIST=' + metadata.performerInfo,
                                    'ARTIST=' + metadata.artist,
                                    'TRACKNUMBER=' + metadata.trackNumber,
                                    'DISCNUMBER=' + metadata.partOfSet,
                                    'TRACKTOTAL=' + ajson.nb_tracks,
                                    'DISCTOTAL=' + tjson.disk_number,
                                    'PUBLISHER=' + metadata.label,
                                    'LENGTH=' + metadata.duration,
                                    'ISRC=' + metadata.ISRC,
                                    'ITUNESADVISORY=' + metadata.explicit
                                ];
                                if(metadata.genre){
                                    flacComments.push('GENRE=' + metadata.genre);
                                }
                                if (0 < parseInt(metadata.year)) {
                                    flacComments.push('DATE=' + metadata.year);
                                }
                                if (0 < parseInt(metadata.bpm)) {
                                    flacComments.push('BPM=' + metadata.bpm);
                                }
                                const reader = fs.createReadStream(tempPath);
                                const writer = fs.createWriteStream(writePath);
                                let processor = new mflac.Processor({parseMetaDataBlocks: true});
                                
                                let vendor = 'reference libFLAC 1.2.1 20070917';
                                
                                let cover = fs.readFileSync(metadata.image);
                                let mdbVorbisPicture;
                                let mdbVorbisComment;
                                processor.on('preprocess', (mdb) => {
                                    // Remove existing VORBIS_COMMENT and PICTURE blocks, if any.
                                    if (mflac.Processor.MDB_TYPE_VORBIS_COMMENT === mdb.type) {
                                        mdb.remove();
                                    } else if (mflac.Processor.MDB_TYPE_PICTURE === mdb.type) {
                                        mdb.remove();
                                    }
                                    
                                    if (mdb.isLast) {
                                        mdbVorbisPicture = mflac.data.MetaDataBlockPicture.create(true, 3, 'image/jpeg', '', 1200, 1200, 24, 0, cover);
                                        mdbVorbisComment = mflac.data.MetaDataBlockVorbisComment.create(false, vendor, flacComments);
                                        mdb.isLast = false;
                                    }
                                });
                                
                                processor.on('postprocess', (mdb) => {
                                    if (mflac.Processor.MDB_TYPE_VORBIS_COMMENT === mdb.type && null !== mdb.vendor) {
                                        vendor = mdb.vendor;
                                    }
                                    
                                    if (mdbVorbisPicture && mdbVorbisComment) {
                                        processor.push(mdbVorbisComment.publish());
                                        processor.push(mdbVorbisPicture.publish());
                                    }
                                });

                                reader.on('end', () => {
                                    fs.remove(writePath+".temp");
                                });
                                
                                reader.pipe(processor).pipe(writer);
                            }else{
                                //Write ID3-Tags
                                if (!nodeID3.write(metadata, writePath)) {
                                    //log
                                }
                            }

                            callback();
                        });
                    });
                });
            });
        });
    }

    function checkIfAlreadyInQueue(id) {
        let exists = false;
        for (let i = 0; i < socket.downloadQueue.length; i++) {
            if (socket.downloadQueue[i].id == id) {
                exists = socket.downloadQueue[i].queueId;
            }
        }
        if (socket.currentItem && (socket.currentItem.id == id)) {
            exists = socket.currentItem.queueId;
        }
        return exists;
    }
});

// Helper functions

/**
 * Updates individual parameters in the settings file
 * @param config
 * @param value
 */
function updateSettingsFile(config, value) {
    configFile.userDefined[config] = value;

    fs.writeFile(configFileLocation, JSON.stringify(configFile, null, 2), function (err) {
        if (err) return winston.log('error', 'error', err);
        console.log('Settings Updated');

        // FIXME: Endless Loop, due to call from initFolders()...crashes soon after startup
        // initFolders();
    });
}

/**
 * Replaces bad characters in metadata and files
 * @param input
 * @param file boolean
 * @returns {*}
 */
function fixName (input, file) {
  const regEx = file ? /[,\/\\:*?"<>|]/g : /[\/\\"<>*?:|]|\.$/g;
  return removeDiacritics(input.replace(regEx, '_'));
}

function antiDot(str){
    while(str[str.length-1] == "." || str[str.length-1] == " " || str[str.length-1] == "\n"){
        str = str.substring(0,str.length-1);
    }
    if(str.length < 1){
        str = "dot";
    }
    return str;
}

/**
 * Removes diacritics, obviously
 * @param str
 * @returns {*}
 */
function removeDiacritics(str) {

    const defaultDiacriticsRemovalMap = [
        {
            'base': 'A',
            'letters': /[\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F]/g
        },
        {'base': 'AA', 'letters': /[\uA732]/g},
        {'base': 'AE', 'letters': /[\u00C6\u01FC\u01E2]/g},
        {'base': 'AO', 'letters': /[\uA734]/g},
        {'base': 'AU', 'letters': /[\uA736]/g},
        {'base': 'AV', 'letters': /[\uA738\uA73A]/g},
        {'base': 'AY', 'letters': /[\uA73C]/g},
        {'base': 'B', 'letters': /[\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181]/g},
        {'base': 'C', 'letters': /[\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E]/g},
        {
            'base': 'D',
            'letters': /[\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779]/g
        },
        {'base': 'DZ', 'letters': /[\u01F1\u01C4]/g},
        {'base': 'Dz', 'letters': /[\u01F2\u01C5]/g},
        {
            'base': 'E',
            'letters': /[\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E]/g
        },
        {'base': 'F', 'letters': /[\u0046\u24BB\uFF26\u1E1E\u0191\uA77B]/g},
        {
            'base': 'G',
            'letters': /[\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E]/g
        },
        {
            'base': 'H',
            'letters': /[\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D]/g
        },
        {
            'base': 'I',
            'letters': /[\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197]/g
        },
        {'base': 'J', 'letters': /[\u004A\u24BF\uFF2A\u0134\u0248]/g},
        {
            'base': 'K',
            'letters': /[\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2]/g
        },
        {
            'base': 'L',
            'letters': /[\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780]/g
        },
        {'base': 'LJ', 'letters': /[\u01C7]/g},
        {'base': 'Lj', 'letters': /[\u01C8]/g},
        {'base': 'M', 'letters': /[\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C]/g},
        {
            'base': 'N',
            'letters': /[\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4]/g
        },
        {'base': 'NJ', 'letters': /[\u01CA]/g},
        {'base': 'Nj', 'letters': /[\u01CB]/g},
        {
            'base': 'O',
            'letters': /[\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C]/g
        },
        {'base': 'OI', 'letters': /[\u01A2]/g},
        {'base': 'OO', 'letters': /[\uA74E]/g},
        {'base': 'OU', 'letters': /[\u0222]/g},
        {'base': 'P', 'letters': /[\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754]/g},
        {'base': 'Q', 'letters': /[\u0051\u24C6\uFF31\uA756\uA758\u024A]/g},
        {
            'base': 'R',
            'letters': /[\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782]/g
        },
        {
            'base': 'S',
            'letters': /[\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784]/g
        },
        {
            'base': 'T',
            'letters': /[\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786]/g
        },
        {'base': 'TZ', 'letters': /[\uA728]/g},
        {
            'base': 'U',
            'letters': /[\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244]/g
        },
        {'base': 'V', 'letters': /[\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245]/g},
        {'base': 'VY', 'letters': /[\uA760]/g},
        {'base': 'W', 'letters': /[\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72]/g},
        {'base': 'X', 'letters': /[\u0058\u24CD\uFF38\u1E8A\u1E8C]/g},
        {
            'base': 'Y',
            'letters': /[\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE]/g
        },
        {
            'base': 'Z',
            'letters': /[\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762]/g
        },
        {
            'base': 'a',
            'letters': /[\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250]/g
        },
        {'base': 'aa', 'letters': /[\uA733]/g},
        {'base': 'ae', 'letters': /[\u00E6\u01FD\u01E3]/g},
        {'base': 'ao', 'letters': /[\uA735]/g},
        {'base': 'au', 'letters': /[\uA737]/g},
        {'base': 'av', 'letters': /[\uA739\uA73B]/g},
        {'base': 'ay', 'letters': /[\uA73D]/g},
        {'base': 'b', 'letters': /[\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253]/g},
        {'base': 'c', 'letters': /[\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184]/g},
        {
            'base': 'd',
            'letters': /[\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A]/g
        },
        {'base': 'dz', 'letters': /[\u01F3\u01C6]/g},
        {
            'base': 'e',
            'letters': /[\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD]/g
        },
        {'base': 'f', 'letters': /[\u0066\u24D5\uFF46\u1E1F\u0192\uA77C]/g},
        {
            'base': 'g',
            'letters': /[\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F]/g
        },
        {
            'base': 'h',
            'letters': /[\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265]/g
        },
        {'base': 'hv', 'letters': /[\u0195]/g},
        {
            'base': 'i',
            'letters': /[\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131]/g
        },
        {'base': 'j', 'letters': /[\u006A\u24D9\uFF4A\u0135\u01F0\u0249]/g},
        {
            'base': 'k',
            'letters': /[\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3]/g
        },
        {
            'base': 'l',
            'letters': /[\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747]/g
        },
        {'base': 'lj', 'letters': /[\u01C9]/g},
        {'base': 'm', 'letters': /[\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F]/g},
        {
            'base': 'n',
            'letters': /[\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5]/g
        },
        {'base': 'nj', 'letters': /[\u01CC]/g},
        {
            'base': 'o',
            'letters': /[\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275]/g
        },
        {'base': 'oi', 'letters': /[\u01A3]/g},
        {'base': 'ou', 'letters': /[\u0223]/g},
        {'base': 'oo', 'letters': /[\uA74F]/g},
        {'base': 'p', 'letters': /[\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755]/g},
        {'base': 'q', 'letters': /[\u0071\u24E0\uFF51\u024B\uA757\uA759]/g},
        {
            'base': 'r',
            'letters': /[\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783]/g
        },
        {
            'base': 's',
            'letters': /[\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B]/g
        },
        {
            'base': 't',
            'letters': /[\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787]/g
        },
        {'base': 'tz', 'letters': /[\uA729]/g},
        {
            'base': 'u',
            'letters': /[\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289]/g
        },
        {'base': 'v', 'letters': /[\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C]/g},
        {'base': 'vy', 'letters': /[\uA761]/g},
        {'base': 'w', 'letters': /[\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73]/g},
        {'base': 'x', 'letters': /[\u0078\u24E7\uFF58\u1E8B\u1E8D]/g},
        {
            'base': 'y',
            'letters': /[\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF]/g
        },
        {
            'base': 'z',
            'letters': /[\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763]/g
        }
    ];

    for (let i = 0; i < defaultDiacriticsRemovalMap.length; i++) {
        str = str.replace(defaultDiacriticsRemovalMap[i].letters, defaultDiacriticsRemovalMap[i].base);
    }

    return str;

}

/**
 * Initialize the temp folder for covers and main folder for downloads
 */
function initFolders() {
    // Check if main folder exists
    if (!fs.existsSync(mainFolder)) {
        mainFolder = defaultDownloadDir;
        updateSettingsFile('downloadLocation', defaultDownloadDir);
    }

    fs.removeSync(coverArtFolder);
    fs.ensureDirSync(coverArtFolder);

}

/**
 * Creates the name of the tracks replacing wildcards to correct metadata
 * @param metadata
 * @param filename
 * @param playlist
 * @returns {XML|string|*}
 */
function settingsRegex(metadata, filename, playlist) {
    filename = filename.replace(/%title%/g, metadata.title);
    filename = filename.replace(/%album%/g, metadata.album);
    filename = filename.replace(/%artist%/g, metadata.artist);
    filename = filename.replace(/%year%/g, metadata.year);
    if(typeof metadata.trackNumber != 'undefined'){
        filename = filename.replace(/%number%/g, splitNumber(metadata.trackNumber));
    } else {
        filename = filename.replace(/%number%/g, '');
    }
    if (playlist) {
        filename = filename.replace(/%number%/g, pad(playlist.position + 1, playlist.fullSize.toString().length));
    }
    return filename;
}

/**
 * I really don't understand what this does ... but it does something
 * @param str
 * @param max
 * @returns {String|string|*}
 */
function pad(str, max) {
    str = str.toString();
    return str.length < max ? pad("0" + str, max) : str;
}

/**
 * Splits the %number%
 * @param string str
 * @return string
 */
function splitNumber(str){
    str = str.toString();
    var i = str.indexOf("/");
    return i > 0 ? str.slice(0, i) : str;
}

/**
 * An interval that stops after a number of repetitions
 * @param success
 * @param delay
 * @param repetitions
 */
function magicInterval(success, delay, repetitions) {
    let x = 0;
    let intervalID = setInterval(function () {

        success(intervalID);

        if (++x === repetitions) {
            clearInterval(intervalID);
        }
    }, delay);
}

// Show crash error in console for debugging
process.on('uncaughtException', function (err) {
    console.trace(err);
});

// Exporting vars
module.exports.triesToConnect = triesToConnect;
module.exports.mainFolder = mainFolder;
module.exports.defaultSettings = defaultSettings;
module.exports.defaultDownloadDir = defaultDownloadDir;
