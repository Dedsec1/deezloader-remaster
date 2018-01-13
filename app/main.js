// Load settings before everything
let appConfig;
const fs = require("fs-extra");
const path = require('path');
const electron = require('electron');
const app = electron.app;
const configpath = app.getPath("userData")+path.sep+"config.json";
loadSettings();

const theApp = require('./app');
const BrowserWindow = electron.BrowserWindow;
const WindowStateManager = require('electron-window-state-manager');

const url = require('url');

let mainWindow;


// Create a new instance of the WindowStateManager
const mainWindowState = new WindowStateManager('mainWindow', {
	defaultWidth: 1280,
	defaultHeight: 800
});

require('electron-context-menu')({
	showInspectElement: false
});

function loadSettings(){
	//Check if the parent folder doesn't exists
	if(!fs.existsSync(app.getPath("userData"))){
		//Creates a folder
		fs.mkdirSync(app.getPath("userData"));
	}
	//Checks if there is a config
	if(fs.existsSync(configpath)){
		//Tries to check if the config is real
		try{
			appConfig = require(configpath);
			if(appConfig.userDefined.trackNameTemplate && appConfig.userDefined.playlistTrackNameTemplate && appConfig.serverPort){
								
			}else{
				//Creates a config
				fs.writeFileSync(configpath,fs.readFileSync(__dirname+path.sep+"default.json",'utf8'));
				appConfig = require(configpath);
			}
		}catch(err){
			//Creates a config
			fs.writeFileSync(configpath,fs.readFileSync(__dirname+path.sep+"default.json",'utf8'));
			appConfig = require(configpath);
		}
	}else{
		//Creates a config
		fs.writeFileSync(configpath,fs.readFileSync(__dirname+path.sep+"default.json",'utf8'));
		appConfig = require(configpath);
	}
}

function createWindow () {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: mainWindowState.width,
		height: mainWindowState.height,
		x: mainWindowState.x,
		y: mainWindowState.y,
		frame: false,
		icon: __dirname + "/icon.png"
	});

	mainWindow.setMenu(null);

	// and load the index.html of the app.
	mainWindow.loadURL('http://localhost:' + appConfig.serverPort);

	mainWindow.on('closed', function () {
		mainWindow = null;
	});

	// Check if window was closed maximized and restore it
	if (mainWindowState.maximized) {
		mainWindow.maximize();
	}

	// Save current window state
	mainWindow.on('close', () => {
		mainWindowState.saveState(mainWindow);
	});
}

app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
	app.quit();
});

app.on('activate', function () {
	if (mainWindow === null) {
		createWindow();
	}
});
