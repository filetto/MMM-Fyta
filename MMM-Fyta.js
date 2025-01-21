

var data = {
    "plants": []
}


function getStatusText(status){
    switch(status){
        case 1:
            return "Too Low";
        case 2:
            return "Low";
        case 3:
            return "Perfect";
        case 4:
            return "High";
        case 5:
            return "Too High";
        default:
            return "Unknown";
    }

}

function createFlexboxLayoutFromJSON(jsonData) {
    // Create a container for the flexbox layout
    var container = document.createElement("div");
    container.className = "flex-container";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "10px"; // Space between rows

    // Header
    var header = document.createElement("div");
    header.className = "flex-header";
    header.style.display = "flex";
    header.style.marginBottom = "10px"; // Space below header
    header.style.fontWeight = "bold";

    var nameHeader = document.createElement("div");
    nameHeader.textContent = "Plants";
    nameHeader.style.flex = "1";
    nameHeader.style.marginRight = "10px"; // Space between columns

    var statusHeader = document.createElement("div");
    statusHeader.style.flex = "3";

    header.appendChild(nameHeader);
    header.appendChild(statusHeader);
    container.appendChild(header);

    // Iterate over each plant to create rows
    jsonData.plants.forEach(plant => {
        var row = document.createElement("div");
        row.className = "flex-row";
        row.style.display = "flex";
        row.style.alignItems = "center"; // Align items vertically in the center
        row.style.marginBottom = "10px"; // Space between rows

        var nameCell = document.createElement("div");
        nameCell.textContent = plant.nickname;
        nameCell.style.flex = "1";
        nameCell.style.marginLeft = "10px"; // Space between columns
        nameCell.style.fontWeight = "bold";

        var statusCell = document.createElement("div");
        statusCell.className = "flex-cell";
        statusCell.style.flex = "3";
        statusCell.style.display = "flex";
        statusCell.style.flexDirection = "column";
        statusCell.style.gap = "5px"; // Space between status items
        statusCell.style.textAlign = "left";

        // Adding statuses with icons
        var moistureDiv = document.createElement("div");
        moistureDiv.innerHTML = `<i class="fas fa-tint"></i> ${getStatusText(plant.moisture_status)}`;
        statusCell.appendChild(moistureDiv);

        var lightDiv = document.createElement("div");
        lightDiv.innerHTML = `<i class="fas fa-sun"></i> ${getStatusText(plant.light_status)}`;
        statusCell.appendChild(lightDiv);

        var salinityDiv = document.createElement("div");
        salinityDiv.innerHTML = `<i class="fas fa-seedling"></i> ${getStatusText(plant.salinity_status)}`;
        statusCell.appendChild(salinityDiv);

        var temperatureDiv = document.createElement("div");
        temperatureDiv.innerHTML = `<i class="fa-solid fa-temperature-low icon"></i> ${getStatusText(plant.temperature_status)}`;
        statusCell.appendChild(temperatureDiv);
    

        row.appendChild(statusCell);
        row.appendChild(nameCell);

        container.appendChild(row);
    });

    // Append the container to the body or another element of your choice
    return container.outerHTML;
}



Module.register("MMM-Fyta", {
    defaults: {
        reloadIntervalInMs: 1 * 60 * 60 * 1000, // 1 hour
        },
        start: function() {
            this.sendSocketNotification("START_FETCHER", this.config);
            this.updateDom();
        },
    getDom: function() {
        var wrapper = document.createElement("div");
        wrapper.innerHTML = createFlexboxLayoutFromJSON(data);
        return wrapper;
    },
    getStyles: function() {
        return ['font-awesome.css'];
    },
    socketNotificationReceived (notification, payload) {
		if (notification === "PLANTS") {
            data = payload;
            this.updateDom();
        }
	},
});
