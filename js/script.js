// Event listeners
document.querySelector("#quakeForm").addEventListener("submit", async function (event) {
    event.preventDefault(); 

const continentSelect = document.querySelector("#continent");
const continentError = document.querySelector("#continentError");

//functions
function getContinentBounds(continent) {
    switch (continent) {
        case "world":
            return {
                minlat: -90, maxlat: 90,
                minlon: -180, maxlon: 180
            };
        case "africa":
            return {
                minlat: -35, maxlat: 38,
                minlon: -18, maxlon: 52
            };
        case "asia":
            return {
                minlat: 5, maxlat: 80,
                minlon: 25, maxlon: 180
            };
        case "europe":
            return {
                minlat: 35, maxlat: 72,
                minlon: -25, maxlon: 45
            };
        case "north_america":
            return {
                minlat: 5, maxlat: 83,
                minlon: -168, maxlon: -52
            };
        case "south_america":
            return {
                minlat: -56, maxlat: 13,
                minlon: -82, maxlon: -34
            };
        case "oceania":
            return {
                minlat: -50, maxlat: 0,
                minlon: 110, maxlon: 180
            };
        case "antarctica":
            return {
                minlat: -90, maxlat: -60,
                minlon: -180, maxlon: 180
            };
        default:
            return null;
    }
}

// Get values
const startDateInput = document.querySelector("#startDate");
const minMagInput = document.querySelector("#minMag");
const limitInput = document.querySelector("#limit");

const dateError = document.querySelector("#dateError");
const magError = document.querySelector("#magError");
const statusMsg = document.querySelector("#statusMsg");
const resultsContainer = document.querySelector("#resultsContainer");

//clear old messages
continentError.textContent = "";
dateError.textContent = "";
magError.textContent = "";
statusMsg.textContent = "";
resultsContainer.innerHTML = "";

//validation:
const continentValue = continentSelect.value;

let isValid = true;

// validate continent
if (!continentValue) {
    continentError.textContent = "Please select a continent.";
    isValid = false;
}

// Validate start date
if (!startDateInput.value) {
    dateError.textContent = "Please select a start date.";
    isValid = false;
}

// Validate magnitude: between 0 and 10
const minMag = parseFloat(minMagInput.value);
if (isNaN(minMag) || minMag < 0 || minMag > 10) {
    magError.textContent = "Magnitude must be between 0 and 10.";
    isValid = false;
}

if (!isValid) {
    return;
}

const bounds = getContinentBounds(continentValue);
if (!bounds) {
    statusMsg.textContent = "Invalid continent selection.";
    return;
}

// if everything is valid, build API URL
const startDate = startDateInput.value;
const limit = parseInt(limitInput.value) || 20;

// USGS Earthquake API Docs: https://earthquake.usgs.gov/fdsnws/event/1/
const baseUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query";

// request GeoJSON format
const url = `${baseUrl}?format=geojson&starttime=${startDate}&minmagnitude=${minMag}&limit=${limit}`
+ `&minlatitude=${bounds.minlat}&maxlatitude=${bounds.maxlat}`
+ `&minlongitude=${bounds.minlon}&maxlongitude=${bounds.maxlon}`;

statusMsg.textContent = "Loading earthquakes...";

try {
    // fetch()
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Network response was not ok");
    }

    const data = await response.json();

    const quakes = data.features;

    if (!quakes || quakes.length === 0) {
        statusMsg.textContent = "No earthquakes found for your criteria.";
        return;
    }

    statusMsg.textContent = `Found ${quakes.length} earthquakes.`;

    // display data for end user
    quakes.forEach(q => {
        const props = q.properties;
        const mag = props.mag;
        const place = props.place;
        const time = new Date(props.time);

        const card = document.createElement("div");
        card.classList.add("quake-card");

        const title = document.createElement("div");
        title.classList.add("quake-title");
        title.textContent = `Magnitude: ${mag} – ${place}`;

        const meta = document.createElement("div");
        meta.classList.add("quake-meta");
        meta.innerHTML = `
            Time: ${time.toLocaleString()} <br>
            Depth (in km): ${q.geometry.coordinates[2]} km <br>
            More info: <a href="${props.url}" target="_blank">USGS Detail Page</a>
        `;

        card.appendChild(title);
        card.appendChild(meta);
        resultsContainer.appendChild(card);
    });

    } catch (error) {
        console.error(error);
        statusMsg.textContent = "Error retrieving earthquake data. Please try again later.";
    }
});