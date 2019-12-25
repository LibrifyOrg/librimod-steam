class SteamLauncherPlugin {
	enable(app) {
		this.app = app;

		const SteamLauncher = require("./launcher")(this.app);
		const launcher = new SteamLauncher();

		this.app.games.launchers.register("steam", launcher);
		this.app.games.actionTypes.register("steam", launcher.launch);
	}

	disable() {
		this.app.games.launchers.unregister("steam");
		this.app.games.actionTypes.unregister("steam");
	}
}

module.exports = new SteamLauncherPlugin();