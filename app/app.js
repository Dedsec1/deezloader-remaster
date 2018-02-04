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
var userdata = "";
var homedata = "";
if(process.env.APPDATA){
	userdata = process.env.APPDATA + path.sep + "Deezloader\\";
	homedata = os.homedir();
}else if(process.platform == "darwin"){
	homedata = os.homedir();
	userdata = homedata + '/Library/Application Support/Deezloader/';
}else if(process.platform == "android"){
	homedata = os.homedir() + "/storage/shared/";
	userdata = homedata + "/Deezloader/";
}else{
	homedata = os.homedir();
	userdata = homedata + '/.config/Deezloader/';
}

if(!fs.existsSync(userdata+"config.json")){
	fs.outputFileSync(userdata+"config.json",fs.readFileSync(__dirname+path.sep+"default.json",'utf8'));
}

let configFile = require(userdata+path.sep+"config.json");

// Main Constants
const configFileLocation = userdata+"config.json";
const autologinLocation = userdata+"autologin";
const coverArtFolder = os.tmpdir() + path.sep + 'deezloader-imgs' + path.sep;
const defaultDownloadDir = homedata + path.sep + "Music" + path.sep + 'Deezloader' + path.sep;
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
    request.get("https://gitlab.com/ExtendLord/DeezLoader-Reborn/raw/master/VERSION.md", function (error, response, body) {
        if(!error && response.statusCode == 200){
            if(body.split("\n")[0] != packagejson.version){
                socket.emit("newupdate",body.split("\n")[0]);
            }
        }else{
            console.log(error);
        }
    });
    socket.on("login", function (username, password, autologin) {
        Deezer.init(username, password, function (err) {
            if(err){
                socket.emit("login", err.message);
            }else{
                if(autologin){
                    var data = username + "\n" + password;
                    fs.outputFile(autologinLocation, alencrypt(data) , function(){
                    });
                }
                socket.emit("login", "none");
            }
        });
    });
    socket.on("checkInit", function () {
	    var r = request.get({url:"https://www.deezer.com/track/99976952",timeout:8000}, function (error, response, body) {
	        if(error){
	        	socket.emit("checkInit", "Conncetion error, trying again.");
	        }else if(response.request.uri.href.includes("track")){
	        	socket.emit("checkInit","");
	        }else{
	            socket.emit("checkInit","Requires an Account");
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
                    if(!t.readable && t.alternative){
                        return t.alternative.id;
                    }
                    return t.id;
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
                    if(!t.readable && t.alternative){
                        return t.alternative.id;
                    }
                    return t.id;
                });
                downloading.settings.tagPosition = true;
                downloading.settings.addToPath = fixName(downloading.artist) + " - " + antiDot(downloading.name);
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
            if(err){
                return;
            }
            if(charts){
                charts = charts.data || [];
            }else{
                charts = [];
            }
            socket.emit("getChartsTopCountry", {charts: charts.data, err: err});
        });
    });

    socket.on("getChartsCountryList", function (data) {
        Deezer.getChartsTopCountry(function (charts, err) {
            if(err){
                return;
            }
            if(charts){
                charts = charts.data || [];
            }else{
                charts = [];
            }
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
            if(err){
                return;
            }
            if(charts){
                charts = charts.data || [];
            }else{
                charts = [];
            }
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
        fs.outputFile(configFileLocation, JSON.stringify(configFile, null, 2), function (err) {
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
                    if(track["SNG_CONTRIBUTORS"]){
                    	if(track["SNG_CONTRIBUTORS"].composer){
		                    var composertag = "";
		                    for (var i = 0; i < track["SNG_CONTRIBUTORS"].composer.length; i++) {
		                    	composertag += track["SNG_CONTRIBUTORS"].composer[i] + ", ";
		                    }
		                    composertag = composertag.substring(0,composertag.length-2);
	                	}
	                	if(track["SNG_CONTRIBUTORS"].musicpublisher){
		                    var publishertag = "";
		                    for (var i = 0; i < track["SNG_CONTRIBUTORS"].musicpublisher.length; i++) {
		                    	publishertag += track["SNG_CONTRIBUTORS"].musicpublisher[i] + ", ";
		                    }
		                    publishertag = publishertag.substring(0,publishertag.length-2);
	                	}
                	}
                    let metadata = {
                        title: track["SNG_TITLE"],
                        artist: track["ART_NAME"],
                        album: track["ALB_TITLE"],
                        performerInfo: ajson.artist.name,
                        trackNumber: track["TRACK_NUMBER"] + "/" + ajson.nb_tracks,
                        partOfSet: track["DISK_NUMBER"] + "/" + tjson.disk_number,
                        label: ajson.label,
                        isrc: track["ISRC"],
                        copyright: track["COPYRIGHT"],
                        duration: track["DURATION"],
                        BARCODE: ajson.upc,
                        explicit: track["EXPLICIT_LYRICS"]
                    };
                    if(composertag){
                        metadata.composer = composertag;
                    }
                    if(track["LYRICS_TEXT"]){
                        metadata.USLT = track["LYRICS_TEXT"];
                    }
                    if(publishertag){
                    	metadata.publisher = publishertag;
                    }
                    if(!settings.tagPosition && !(settings.createArtistFolder || settings.createAlbumFolder) && settings.playlist){
                        metadata.trackNumber = (parseInt(settings.playlist.position)+1).toString() + "/" + settings.playlist.fullSize;
                        metadata.partOfSet = "1/1";
                    }
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
                        metadata.date = track["PHYSICAL_RELEASE_DATE"];
                    }
                    let filename = fixName(`${metadata.artist} - ${metadata.title}`);
                    if (settings.filename) {
                        filename = fixName(settingsRegex(metadata, settings.filename, settings.playlist));
                    }

                    let filepath = mainFolder;
                    if (settings.createArtistFolder || settings.createAlbumFolder) {
                        if (settings.createArtistFolder) {
                            filepath += fixName(metadata.artist) + path.sep;
                            if (!fs.existsSync(filepath)) {
                                fs.mkdirSync(filepath);
                            }
                        }

                        if (settings.createAlbumFolder) {
                            filepath += fixName(settings.createArtistFolder ? metadata.album : `${metadata.artist} - ${metadata.album}`) + path.sep;
                            if (!fs.existsSync(filepath)) {
                                fs.mkdirSync(filepath);
                            }
                        }
                    } else if (settings.addToPath) {
                        filepath += settings.addToPath + path.sep;
                    }


                    fs.ensureDirSync(filepath);

                    let writePath;
                    if(track.format == 9){
                        if(parseInt(tjson.disk_number) > 1 && (settings.tagPosition || settings.createAlbumFolder)){
                            writePath = filepath + track["DISK_NUMBER"] + path.sep + filename + '.flac';
                        }else{
                            writePath = filepath + filename + '.flac';
                        }
                    }else{
                        if(parseInt(tjson.disk_number) > 1 && (settings.tagPosition || settings.createAlbumFolder)){
                            writePath = filepath + track["DISK_NUMBER"] + path.sep + filename + '.mp3';
                        }else{
                            writePath = filepath + filename + '.mp3';
                        }
                    }
                    if(track["LYRICS_SYNC_JSON"]){
                        var lyricsbuffer = "";
                        for(var i=0;i<track["LYRICS_SYNC_JSON"].length;i++){
                            if(track["LYRICS_SYNC_JSON"][i].lrc_timestamp){
                                lyricsbuffer += track["LYRICS_SYNC_JSON"][i].lrc_timestamp+track["LYRICS_SYNC_JSON"][i].line+"\r\n";
                            }else if(i > 0 && i < track["LYRICS_SYNC_JSON"].length){
                                var date = new Date(parseInt(track["LYRICS_SYNC_JSON"][i-1].milliseconds)+(parseInt(track["LYRICS_SYNC_JSON"][i+1].milliseconds)-parseInt(track["LYRICS_SYNC_JSON"][i-1].milliseconds))/2);
                                var m = date.getMinutes().toString();
                                var s = date.getSeconds().toString();
                                var ms = date.getMilliseconds().toString().substring(0,2);
                                if(m.length == 1){
                                    m = "0"+m;
                                }
                                if(s.length == 1){
                                    s = "0"+s;
                                }
                                lyricsbuffer += "["+m+":"+s+"."+ms+"]"+"\r\n";
                            }
                        }
                        if(track.format == 9){
                            fs.outputFile(writePath.substring(0,writePath.length-5)+".lrc",lyricsbuffer,function(){});
                        }else{
                            metadata.SYLT = lyricsbuffer;
                        }
                    }
                    console.log('Downloading file to ' + writePath);

                    if (fs.existsSync(writePath)) {
                        console.log("Already downloaded: " + metadata.artist + ' - ' + metadata.title);
                        callback();
                        return;
                    }

                    //Get image
                    if (metadata.image) {
                    	let imgPath;
                        //If its not from an album but a playlist.
                    	if(!settings.tagPosition && !(settings.createArtistFolder || settings.createAlbumFolder)){
                        	imgPath = coverArtFolder + metadata.title + ".jpg";
                    	}else{
                    		imgPath = filepath + "folder.jpg";
                    	}
                    	if(!fs.existsSync(imgPath)){
	                        request.get(metadata.image, {encoding: 'binary'}, function(error,response,body){
	                        	if(error){
	                        		metadata.image = undefined;
	                        		return;
	                        	}
	                        	fs.outputFile(imgPath,body,'binary',function(err){
	                        		if(err){
	                        			metadata.image = undefined;
	                        			return;
	                        		}
	                        		metadata.image = (imgPath).replace(/\\/g, "/");
	                        		condownload();
	                        	})
	                        });
                    	}else{
                    		metadata.image = (imgPath).replace(/\\/g, "/");
                    		condownload();
                    	}
                    }else{
                    	metadata.image = undefined;
                    	condownload();
                    }
                    function condownload(){
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
	                        fs.outputFile(tempPath, buffer, function (err) {
	                            if (err) {
	                                console.log("Failed to download: " + metadata.artist + " - " + metadata.title);
	                                callback(err);
	                                return;
	                            }

	                            if (settings.createM3UFile && settings.playlist) {
	                                if(track.format == 9){
	                                    fs.appendFileSync(filepath + "playlist.m3u", filename + ".flac\r\n");
	                                }else{
	                                    fs.appendFileSync(filepath + "playlist.m3u", filename + ".mp3\r\n");
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
	                                    'TRACKNUMBER=' + track["TRACK_NUMBER"],
	                                    'DISCNUMBER=' + track["DISK_NUMBER"],
	                                    'TRACKTOTAL=' + ajson.nb_tracks,
	                                    'DISCTOTAL=' + tjson.disk_number,
                                        'COPYRIGHT=' + metadata.copyright,
	                                    'LENGTH=' + metadata.duration,
	                                    'ISRC=' + metadata.ISRC,
                                        'BARCODE=' + metadata.BARCODE,
	                                    'ITUNESADVISORY=' + metadata.explicit
	                                ];
                                    if(!settings.tagPosition && !(settings.createArtistFolder || settings.createAlbumFolder) && settings.playlist){
                                        flacComments[5] = 'TRACKNUMBER=' + (parseInt(settings.playlist.position)+1).toString();
                                        flacComments[6] = 'DISCNUMBER=1';
                                        flacComments[7] = 'TRACKTOTAL=' + settings.playlist.fullSize;
                                        flacComments[8] = 'DISCTOTAL=1';

                                    }
                                    if(metadata.USLT){
                                        flacComments.push('LYRICS='+metadata.USLT);
                                    }
	                                if(metadata.genre){
	                                    flacComments.push('GENRE=' + metadata.genre);
	                                }
	                                if (0 < parseInt(metadata.year)) {
	                                    flacComments.push('DATE=' + metadata.date);
	                                    flacComments.push('YEAR=' + metadata.year);
	                                }
	                                if (0 < parseInt(metadata.bpm)) {
	                                    flacComments.push('BPM=' + metadata.bpm);
	                                }
	                                if(metadata.composer){
	                                	flacComments.push('COMPOSER=' + metadata.composer);
	                                }
	                                if(metadata.publisher){
	                                	flacComments.push('ORGANIZATION=' + metadata.publisher);
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
					}
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

    fs.outputFile(configFileLocation, JSON.stringify(configFile, null, 2), function (err) {
        if (err) return winston.log('error', 'error', err);
        console.log('Settings Updated');

        // FIXME: Endless Loop, due to call from initFolders()...crashes soon after startup
        // initFolders();
    });
}


function fixName (txt) {
  const regEx = /[\0\/\\:*?"<>|]/g;
  return txt.replace(regEx, '_');
}

function antiDot(str){
    while(str[str.length-1] == "." || str[str.length-1] == " " || str[str.length-1] == "\n"){
        str = str.substring(0,str.length-1);
    }
    if(str.length < 1){
        str = "dot";
    }
    return fixName(str);
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
