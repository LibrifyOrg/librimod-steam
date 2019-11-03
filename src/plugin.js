class SteamLauncherPlugin {
	constructor(app) {
		const SteamLauncher = require("./launcher")(app);
		const launcher = new SteamLauncher();

		app.games.launchers.register("steam", launcher);
		app.games.actionTypes.register("steam", launcher.launch);
	}
}

module.exports = app => new SteamLauncherPlugin(app);