const NodeHelper = require("node_helper");
const Log = require("logger");
const FytaPlantsFetcher = require("./FytaPlantsFetcher.js");

module.exports = NodeHelper.create({
	// Override start method.
	start () {
		Log.log(`Starting node helper for: ${this.name}`);
	},

    socketNotificationReceived (notification, payload) {
		if (notification === "START_FETCHER") {
			this.createFetcher(payload);
		}
	},

	createFetcher (config) {
		let fetcher;
			Log.log(`Create new plants fetcher`);
			fetcher = new FytaPlantsFetcher(config);

			fetcher.onReceive((plants) => {
				this.broadcastPlants(plants);
			});

			fetcher.onError((fetcher, error) => {
				Log.error("Plants fetcher error. Could not fetch plants",  error);
				let error_type = NodeHelper.checkFetchError(error);
				this.sendSocketNotification("PLANTS_FETCH_ERROR", {
					error_type
				});
			});		

		fetcher.startFetch();
	},

	/**
	 * Creates an object with all feed items of the different registered feeds,
	 * and broadcasts these using sendSocketNotification.
	 */
	broadcastPlants(dataToSend) {		
    console.log(`📡 Broadcasting ${dataToSend.plants ? dataToSend.plants.length : "undefined"} plants with lastUpdate: ${dataToSend.lastUpdate}`);

    if (!Array.isArray(dataToSend.plants)) {
        console.error("❌ FEHLER: `dataToSend.plants` ist kein Array! Datenstruktur prüfen:", dataToSend);
        return;
    }

    this.sendSocketNotification("PLANTS_DATA", dataToSend);
}
});
