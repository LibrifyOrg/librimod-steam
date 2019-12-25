const os = require("os");
const path = require("path");
const fs = require("fs");
const util = require("util");
const vdf = require("simple-vdf2");

async function isDirectory(path) {
	return fs.existsSync(path) && (await (util.promisify(fs.stat)(path))).isDirectory();
}

async function isFile(path) {
	return fs.existsSync(path) && (await (util.promisify(fs.stat)(path))).isFile();
}

module.exports = app => class SteamLauncher extends app.games.launchers.model() {
	constructor() {
		super();

		this.folder = this.getFolder();
	}

	getFolder() {
		switch(os.platform()) {
			case "win32":
				return "C:/Program Files (x86)/Steam";
		}
	}

	async fetchFromFolder(folder) {
		let fileNames = await util.promisify(fs.readdir)(folder);
		let games = [];

		fileNames = fileNames.filter(fileName => fileName.startsWith("appmanifest"));

		for(let fileName of fileNames) {
			const filePath = path.join(folder, fileName);
			const fileData = vdf.parse((await util.promisify(fs.readFile)(filePath)).toString()).AppState;
			const game = this.createGame({name: fileData.name, steamid: fileData.appid, buildid: fileData.buildid});

			games.push(game);
		}

		return games;
	}

	createGame({name, steamid, buildid}) {
		const game = app.games.create({name});

		game.addAction({type: "steam", name: "Launch from Steam", primary: true});
		game.data.steamid = steamid;
		game.data.version = buildid + ".0.0";

		return game;
	}

	async fetchNewGames() {
		super.fetchNewGames();

		const defaultPath = path.join(this.folder, "./steamapps");
		let games = [];

		if(!isDirectory(defaultPath)) {
			return games;
		}

		games = games.concat(await this.fetchFromFolder(defaultPath));

		const librariesPath = path.join(defaultPath, "./libraryfolders.vdf");

		if(isFile(librariesPath)) {
			let librariesData = (await util.promisify(fs.readFile)(librariesPath)).toString();
			let libraries = vdf.parse(librariesData).LibraryFolders;
			let folderNumbers = Object.keys(libraries).filter(key => !isNaN(key));

			for(let folderNumber of folderNumbers) {
				let folder = path.join(libraries[folderNumber], "./steamapps");

				games = games.concat(await this.fetchFromFolder(folder));
			}
		}

		return games;
	}

	async launch(game) {
		await app.electron.shell.openExternal(`steam://rungameid/${game.data.steamid}`);
		app.electron.getCurrentWindow().minimize();
	}
}