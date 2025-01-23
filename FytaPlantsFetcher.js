const crypto = require("node:crypto");
const stream = require("node:stream");
const Log = require("logger");
const NodeHelper = require("node_helper");

const FytaPlantsFetcher = function (config) {
    let authUrl = "http://web.fyta.de/api/auth/login";
    let plantsUrl = "https://web.fyta.de/api/user-plant";
	let reloadTimer = null;
	let plants = [];
	let reloadIntervalMS = config.reloadIntervalInMS || 1000;

	if (reloadIntervalMS < 1000) {
		reloadIntervalMS = 1000;
	}

	let authToken = {};

	let fetchFailedCallback = function () {};
    let authFailedCallback = function () {};
	let plantsReceivedCallback = function () {};

	/* private methods */

	/**
	 * Request the new items.
	 */
	const fetchPlants = async () => {
		clearTimeout(reloadTimer);
		reloadTimer = null;

		if (!authToken && authToken.expiration_date_time < Date.now()) {
			await auth();
		}

		headers = {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${authToken.access_token}`
		};

		try {
			console.log("Hole neue Daten ab der API")
			const response = await fetch(plantsUrl, { headers: headers });
			const json = await response.json();
			plants = json;
			plantsReceivedCallback(plants);
			scheduleTimer();
		}catch (error) {
			console.log("Fetch plants error: ", error)
			fetchFailedCallback(this, error);
			scheduleTimer();
		}
	};


    const auth = async () => {
        const data = { email, password } = config;
        const headers = {
            "Content-Type": "application/json",
        };
        const options = {
            method: "POST",
            headers,
            body: JSON.stringify(data),
        };
		try {
        res = await fetch(authUrl, options)
		if (res.ok) {
			const json = await res.json();
			authToken = json;
			authToken.expiration_date_time = Date.now() + json.expires_in
		} else {
			console.log("Auth failed: ", res)
			authFailedCallback(this, res);
		}
		} catch (error) {
			console.log("Auth error: ", error)
		}
		
    }

	/**
	 * Schedule the timer for the next update.
	 */
	const scheduleTimer = function () {
		clearTimeout(reloadTimer);
		reloadTimer = setTimeout(function () {
			fetchPlants();
		}, reloadIntervalMS);
	};

	/* public methods */

	/**
	 * Update the reload interval, but only if we need to increase the speed.
	 * @param {number} interval Interval for the update in milliseconds.
	 */
	this.setReloadInterval = function (interval) {
		if (interval > 1000 && interval < reloadIntervalMS) {
			reloadIntervalMS = interval;
		}
	};

	/**
	 * Initiate fetchPlants();
	 */
	this.startFetch = async function () {
		console.log("Starting plants fetcher with reload interval: ", reloadIntervalMS)
        await auth();
		fetchPlants();
	};

	/**
	 * Broadcast the existing items.
	 */
	this.broadcastItems = function () {
		if (plants.length <= 0) {
			Log.info("Plants-Fetcher, no plants to broadcast yet.");
			return;
		}
		Log.info(`Plants-Fetcher: Broadcasting ${plants.length} plants.`);
		plansReceivedCallback(this);
	};

	this.onReceive = function (callback) {
		plantsReceivedCallback = callback;
	};

	this.onError = function (callback) {
		fetchFailedCallback = callback;
	};

    this.onAuthError = function (callback) {
		authFailedCallback = callback;
	};

	this.plants = function () {
		return plants;
	};
};

module.exports = FytaPlantsFetcher;
