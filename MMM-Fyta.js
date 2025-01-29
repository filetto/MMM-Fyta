

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

    // Falls keine Pflanzendaten vorhanden sind, zeige eine Lade-Nachricht an
    if (!this.data || !this.data.plants || !Array.isArray(this.data.plants) || this.data.plants.length === 0) {
        wrapper.innerHTML = "Loading plant data...";
        wrapper.className = "dimmed light small";
        return wrapper;
    }

    // **Header erstellen und hinzufügen**
    var title = document.createElement("div");
    title.className = "fyta-title";  // Neue CSS-Klasse für den Header
    title.textContent = "Plants";    // Titel setzen
    title.style.fontSize = "24px";   
    title.style.color = "white";     // Falls Hintergrund dunkel ist
    title.style.fontWeight = "bold";
    title.style.textAlign = "center";
    title.style.marginBottom = "10px";

    wrapper.appendChild(title); // **Titel direkt ins Wrapper-Element einfügen**

    // **Grid-Container für die Pflanzenanzeige**
    var gridContainer = document.createElement("div");
    gridContainer.className = "grid-container"; // CSS-Klasse für das Layout

    // Für jede Pflanze eine Zeile (Swimlane) erstellen
    this.data.plants.forEach(plant => {
        const plantRow = document.createElement("div");
        plantRow.className = "swimlane";

        // Nur den Nicknamen anzeigen (common_name entfernt)
        const plantNameDiv = document.createElement("div");
        plantNameDiv.className = "swimlane-name";
        plantNameDiv.innerHTML = `${plant.nickname}`; // Zeigt nur den Nicknamen
        plantRow.appendChild(plantNameDiv);

        // Balken-Gruppen (für Wasser, Pflanze, Sonne, Temperatur)
        const barGroups = document.createElement("div");
        barGroups.className = "bar-groups";

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

            barContainer.appendChild(iconDiv);
            barGroups.appendChild(barContainer);
        });

        plantRow.appendChild(barGroups);
        gridContainer.appendChild(plantRow);
    });

    // **Grid-Container ins Wrapper-Element einfügen**
    wrapper.appendChild(gridContainer);

    return wrapper; // **Jetzt wird ALLES korrekt zurückgegeben**
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
