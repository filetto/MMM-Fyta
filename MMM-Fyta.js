

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
    getDom: function () {
    const wrapper = document.createElement("div");

    if (!data.plants || !Array.isArray(data.plants) || data.plants.length === 0) {
        wrapper.innerHTML = "Loading plant data...";
        wrapper.className = "dimmed light small";
        return wrapper;
    }

    wrapper.className = "grid-container";

    // Für jede Pflanze eine Zeile (Swimlane) erstellen
    data.plants.forEach(plant => {
        const plantRow = document.createElement("div");
        plantRow.className = "swimlane";

        // Pflanzennamen anzeigen
        const plantNameDiv = document.createElement("div");
        plantNameDiv.className = "swimlane-name";
        plantNameDiv.innerHTML = `${plant.nickname} <span>${plant.common_name}</span>`;
        plantRow.appendChild(plantNameDiv);

        // Balken-Gruppen (für Wasser, Pflanze, Sonne, Temperatur)
        const barGroups = document.createElement("div");
        barGroups.className = "bar-groups";

        // Icons: Wassertropfen, Pflanze, Sonne, Temperatur
        const statuses = [
            { status: plant.moisture_status, icon: "tint" },
            { status: plant.salinity_status, icon: "seedling" },
            { status: plant.light_status, icon: "sun" },
            { status: plant.temperature_status, icon: "temperature-low" }
        ];

        statuses.forEach(({ status, icon }) => {
            const barContainer = document.createElement("div");
            barContainer.className = "bar-container";

            // Balken von unten nach oben generieren (1-5)
            for (let i = 1; i <= 5; i++) {
                const bar = document.createElement("div");
                bar.className = "bar";

                // Färbe den Balken, wenn der Status gleich der Balkennummer ist
                if (i === status) {
                    switch (status) {
                        case 1:
                            bar.classList.add("red");
                            break;
                        case 2:
                            bar.classList.add("orange");
                            break;
                        case 3:
                            bar.classList.add("green");
                            break;
                        case 4:
                            bar.classList.add("orange");
                            break;
                        case 5:
                            bar.classList.add("red");
                            break;
                        default:
                            bar.classList.add("gray");
                    }
                } else {
                    // Standardfarbe (grau) für alle anderen Balken
                    bar.classList.add("gray");
                }

                barContainer.appendChild(bar);
            }

            // Icon hinzufügen
            const iconDiv = document.createElement("div");
            iconDiv.className = "legend-icon";
            const iconElement = document.createElement("i");
            iconElement.className = `fas fa-${icon}`;
            iconDiv.appendChild(iconElement);

            // Icon und Balken in die Gruppe einfügen
            barContainer.appendChild(iconDiv);
            barGroups.appendChild(barContainer);
        });

        plantRow.appendChild(barGroups);
        wrapper.appendChild(plantRow);
    });

    return wrapper;
},



    getStyles: function() {
        return ["MMM-Fyta.css"];
    },
    socketNotificationReceived: function(notification, payload) {
    if (notification === "PLANTS") {
         if (!payload || !Array.isArray(payload.plants)) {
            console.error("MMM-Fyta: Ungültige Daten empfangen:", payload);
            return;
         }
        data.plants = payload.plants;
        console.log("MMM-Fyta: Daten empfangen", payload); // Debug-Log
        this.updateDom();

        // Balken einfärben
        data.plants.forEach(plant => {
            const barGroups = document.getElementById(`${plant.name}-bars`);
            if (barGroups) {
                barGroups.innerHTML = ""; // Vorherige Balken entfernen

                // Statuswerte in umgekehrter Reihenfolge durchlaufen (von unten nach oben)
                plant.status.reverse().forEach((status, index) => {
                    const bar = document.createElement("div");
                    bar.className = "bar";

                    // Farbe basierend auf dem Status setzen
                    switch (status) {
                        case 1:
                            bar.classList.add("red");
                            break;
                        case 2:
                            bar.classList.add("orange");
                            break;
                        case 3:
                            bar.classList.add("green");
                            break;
                        case 4:
                            bar.classList.add("orange");
                            break;
                        case 5:
                            bar.classList.add("red");
                            break;
                        default:
                            bar.classList.add("gray");
                    }

                    barGroups.appendChild(bar);
                });
            }
        });
    }
}

});
