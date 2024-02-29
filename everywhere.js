// Required imports
import * as main from "./Birdhouse/src/main.js";
import { displayError, clearError } from "./Birdhouse/src/modules/input-validation.js";
import { generateMission, checkCompletion } from "./src/game/missions.js";

export let shipState = {
    health: 100,
    shields: 100,
    fuel: 100,
    upgrades: [],
    crew: [],
    currentSpeed: 0,
    targetSpeed: 0,
    engage: false,
    energy: 100,
    lastConsumption: 0,
    isMoving: false,
    position: { x: 0, y: 0 },
    destinationIndex: 0,
    course: { x: 0, y: 0 },
    currentPlanet: 'Earth',
    targetPlanet: null,
    mission: null,
    missionHistory: [],
};

export function formatSpeed(speed) {
    return speed > 0 ? (speed >= 1 ? `Warp ${speed.toFixed(1)}` : `Impulse ${Math.round(speed * 10)}`) : 'Full Stop';
}

export function saveGameState() {
    localStorage.setItem('shipState', JSON.stringify(shipState));
    localStorage.setItem('solarSystems', JSON.stringify(solarSystems));
}

export function resetGame() {
    localStorage.removeItem('shipState');
    localStorage.removeItem('solarSystems');
    window.location.href = main.urlPrefix + '/';
}

export function loadGameState() {
    console.log('Loading game state');
    const savedShipState = JSON.parse(localStorage.getItem('shipState'));
    if (savedShipState) {
        Object.assign(shipState, savedShipState);
    }

    const savedSolarSystemsState = JSON.parse(localStorage.getItem('solarSystems'));
    if (savedSolarSystemsState) {
        Object.assign(solarSystems, savedSolarSystemsState);
    }
}

export function updateShipHealth(amount) {
    shipState.health += amount;
    main.alertPopup(`Ship health updated: ${shipState.health}`);
}

export function updateShipFuel(amount) {
    shipState.fuel += amount;
    main.alertPopup(`Ship fuel updated: ${shipState.fuel}`);
}

export function addShipUpgrade(upgrade) {
    shipState.upgrades.push(upgrade);
    main.alertPopup(`New upgrade added: ${upgrade}`);
}

export function addCrewMember(member) {
    crewState.members.push(member);
    main.alertPopup(`Crew member added: ${member.name}`);
}

export function removeCrewMember(name) {
    crewState.members = crewState.members.filter(member => member.name !== name);
    main.alertPopup(`Crew member removed: ${name}`);
}

const initialSolarSystem = {
    name: "Sol",
    coordinates: { x: 0, y: 0 },
    discovered: true,
    planets: [
        { name: "Mercury", type: "Terrestrial", fauna: "None", flora: "None", population: 0, civilization: "None" },
        { name: "Venus", type: "Terrestrial", fauna: "None", flora: "None", population: 0, civilization: "None" },
        { name: "Earth", type: "Terrestrial", fauna: "Diverse", flora: "Diverse", population: 7700000000, civilization: "Highly Advanced", Faction: "United Nations" },
        { name: "Mars", type: "Terrestrial", fauna: "None", flora: "Sparse", population: 140000, civilization: "Highly Advanced", Faction: "United Nations" },
        { name: "Jupiter", type: "Gas Giant", fauna: "None", flora: "None", population: 0, civilization: "None" },
        { name: "Saturn", type: "Gas Giant", fauna: "None", flora: "None", population: 0, civilization: "None" },
        { name: "Uranus", type: "Ice Giant", fauna: "None", flora: "None", population: 0, civilization: "None" },
        { name: "Neptune", type: "Ice Giant", fauna: "None", flora: "None", population: 0, civilization: "None" }
    ]
};

const emptySpace = {
    name: "Empty Space",
    coordinates: { x: 0, y: 0 },
    discovered: true,
    planets: []
};

export let solarSystems = [initialSolarSystem];

function generateSolarSystems(number) {
    const maxDistance = 1000;
    const planetTypes = ['Terrestrial', 'Gas Giant', 'Ice Giant', 'Dwarf'];
    const faunaTypes = ['None', 'Sparse', 'Abundant', 'Diverse'];
    const floraTypes = ['None', 'Sparse', 'Abundant', 'Diverse'];
    const civilizationTypes = ['None', 'Primitive', 'Advanced', 'Highly Advanced'];

    for (let i = 0; i < number; i++) {
        const name = generateUniqueName(5, 1);
        const coordinates = {
            x: Math.floor(Math.random() * maxDistance) * (Math.random() < 0.5 ? -1 : 1),
            y: Math.floor(Math.random() * maxDistance) * (Math.random() < 0.5 ? -1 : 1)
        };

        let planets = Array.from({ length: Math.floor(Math.random() * 10) }, () => ({
            name: generateUniqueName(4, Math.floor(Math.random() * 3) + 1),
            type: planetTypes[Math.floor(Math.random() * planetTypes.length)],
            fauna: faunaTypes[Math.floor(Math.random() * faunaTypes.length)],
            flora: floraTypes[Math.floor(Math.random() * floraTypes.length)],
            population: Math.floor(Math.random() * 1000000),
            civilization: civilizationTypes[Math.floor(Math.random() * civilizationTypes.length)]
        }));

        planets = planets.sort((a, b) => a.name.localeCompare(b.name));

        solarSystems.push({
            name,
            coordinates,
            discovered: false,
            planets
        });
    }

    solarSystems.sort((a, b) => {
        if (a.name === 'Sol') return -1;
        if (b.name === 'Sol') return 1;
        return a.name.localeCompare(b.name);
    });
}

const syllables = [
    'ba', 'na', 'da', 'ra', 'ka', 'sa', 'ta', 'la', 'pa', 'ma', 'ga', 'ha', 'ja', 'za', 'ca', 'va', 'fa', 'ya', 'wa', 'xa',
    'be', 'ne', 'de', 're', 'ke', 'se', 'te', 'le', 'pe', 'me', 'ge', 'he', 'je', 'ze', 'ce', 've', 'fe', 'ye', 'we', 'xe',
    'bi', 'ni', 'di', 'ri', 'ki', 'si', 'ti', 'li', 'pi', 'mi', 'gi', 'hi', 'ji', 'zi', 'ci', 'vi', 'fi', 'yi', 'wi', 'xi',
    'bo', 'no', 'do', 'ro', 'ko', 'so', 'to', 'lo', 'po', 'mo', 'go', 'ho', 'jo', 'zo', 'co', 'vo', 'fo', 'yo', 'wo', 'xo',
    'bu', 'nu', 'du', 'ru', 'ku', 'su', 'tu', 'lu', 'pu', 'mu', 'gu', 'hu', 'ju', 'zu', 'cu', 'vu', 'fu', 'yu', 'wu', 'xu'];
const generatedNames = new Set();

function generateUniqueName(maxNumSyllables, numWords, attempt = 0) {
    let name = '';
    for (let i = 0; i < numWords; i++) {
        let word = '';
        let numSyllables = Math.floor(Math.random() * maxNumSyllables) + 1;
        for (let j = 0; j < numSyllables; j++) {
            word += syllables[Math.floor(Math.random() * syllables.length)];
        }
        if (generatedNames.has(word)) {
            if (attempt > 200) {
                throw new Error('Failed to generate a unique name');
            }
            return generateUniqueName(maxNumSyllables, numWords, attempt + 1);
        } else {
            generatedNames.add(word);
            word = word.charAt(0).toUpperCase() + word.slice(1);
            name += word + ' ';
        }
    }
    return name.trim();
}

export function findDestinationSystemByCoords(coords) {
    for (const system of solarSystems) {
        if (system.coordinates.x === coords.x && system.coordinates.y === coords.y) {
            return system;
        }
    }

    console.error('Destination not found');
    let thisEmptySpace = emptySpace;
    thisEmptySpace.coordinates = { x: coords.x, y: coords.y };
    return thisEmptySpace;
}

export function findDestinationIndexByCoords(coords) {
    const index = solarSystems.findIndex(system => system.coordinates.x === coords[0] && system.coordinates.y === coords[1]);

    if (index === -1) {
        return null;
    }

    return index;
}

const updateInterval = 1000;

const updateUI = new CustomEvent('updateUI');
function GameLoop() {
    let energyTemp = 0;

    const intervalId = setInterval(() => {
        ShipMovement();
        shipState.lastConsumption = energyTemp - shipState.energy;
        energyTemp = shipState.energy;

        if (shipState.mission == null) {
            generateMission();
        }
        else {
            checkCompletion(shipState.mission);
        }

        saveGameState();

        document.dispatchEvent(updateUI);
    }, updateInterval);
}

function ShipMovement() {
    updateShipPositionAndEnergy();
}

let travelTime = 0;
export let etaCurrentSpeed = 0;
export let etaTargetSpeed = 0;
const defaultTravelTime = 20;
let goingToPlanet = '';

function updateShipPositionAndEnergy() {
    const baseEnergyConsumptionRate = 0.02;
    const distancePerTick = 10;
    const accelerationRate = 0.1;

    let onlyCalculateETA = false;
    if (shipState.currentSpeed === 0 && !shipState.engage) {
        onlyCalculateETA = true;
    }
    else {
        if (shipState.engage && shipState.targetPlanet != null && solarSystems[shipState.destinationIndex].planets.some(planet => planet.name === shipState.targetPlanet.name)) {
            goingToPlanet = shipState.targetPlanet.name;
            travelTime = defaultTravelTime;
            shipState.isMoving = true;
        }
        shipState.engage = false;
    }

    if (!shipState.isMoving || shipState.energy <= 0) {
        shipState.isMoving = false;
        if (shipState.currentSpeed > 0) {
            shipState.currentSpeed -= accelerationRate * 2;
            if (shipState.currentSpeed < 0) {
                shipState.currentSpeed = 0;
            }
        }
    }

    const deltaX = shipState.course.x - shipState.position.x;
    const deltaY = shipState.course.y - shipState.position.y;
    const distanceToDestination = Math.sqrt(deltaX ** 2 + deltaY ** 2);

    if (shipState.currentSpeed > 0) {
        etaCurrentSpeed = (distanceToDestination / distancePerTick) / shipState.currentSpeed;
    }
    else {
        etaCurrentSpeed = 0;
    }

    if (shipState.targetSpeed > 0) {
        etaTargetSpeed = (distanceToDestination / distancePerTick) / shipState.targetSpeed;
    }
    else {
        etaTargetSpeed = 0;
    }

    if (onlyCalculateETA) {
        return;
    }

    if (shipState.energy > 0) {
        if (shipState.currentSpeed < shipState.targetSpeed) {
            shipState.currentSpeed += accelerationRate;
            if (shipState.currentSpeed > shipState.targetSpeed) {
                shipState.currentSpeed = shipState.targetSpeed;
            }
        } else if (shipState.currentSpeed > shipState.targetSpeed) {
            shipState.currentSpeed -= accelerationRate * 2;
            if (shipState.currentSpeed < shipState.targetSpeed) {
                shipState.currentSpeed = shipState.targetSpeed;
            }
        }
    }

    if (shipState.targetSpeed > 0 && shipState.course.x == shipState.position.x && shipState.course.y == shipState.position.y && shipState.targetPlanet !== null && travelTime > 0) {
        if (shipState.targetPlanet.name != goingToPlanet) {
            travelTime = defaultTravelTime;
            goingToPlanet = shipState.targetPlanet.name;
        }

        travelTime -= updateInterval / 1000 * shipState.currentSpeed;

        if (travelTime < defaultTravelTime * 0.75) {
            shipState.currentPlanet = null;
        }

        if (travelTime <= 0 || shipState.targetPlanet.name == shipState.currentPlanet) {
            shipState.currentPlanet = shipState.targetPlanet.name;
            shipState.targetPlanet = null;
            shipState.isMoving = false;
            shipState.currentSpeed = 0;
            main.alertPopup(`Now orbiting ${shipState.currentPlanet}`);
            etaCurrentSpeed = 0;
            etaTargetSpeed = 0;
        }
        else {
            etaCurrentSpeed = travelTime / shipState.currentSpeed;
            etaTargetSpeed = travelTime / shipState.targetSpeed;
        }
    }
    else if (distanceToDestination <= distancePerTick * shipState.currentSpeed) {
        shipState.position.x = shipState.course.x;
        shipState.position.y = shipState.course.y;
        main.alertPopup(`Arrived at ${findDestinationSystemByCoords(shipState.course).name}`);

        if (shipState.targetPlanet != null && solarSystems[shipState.destinationIndex].planets.some(planet => planet.name === shipState.targetPlanet.name)) {
            goingToPlanet = shipState.targetPlanet.name;
            travelTime = defaultTravelTime;
        }
        else {
            shipState.isMoving = false;
            shipState.currentSpeed = 0;
        }

        etaCurrentSpeed = 0;
        etaTargetSpeed = 0;
    } else {
        shipState.currentPlanet = null;

        const angleToDestination = Math.atan2(deltaY, deltaX);
        shipState.position.x += Math.cos(angleToDestination) * distancePerTick * shipState.currentSpeed;
        shipState.position.y += Math.sin(angleToDestination) * distancePerTick * shipState.currentSpeed;

        const energyConsumptionRate = baseEnergyConsumptionRate * Math.pow(shipState.currentSpeed, 2);
        shipState.energy -= energyConsumptionRate;
        if (shipState.energy < 0 && shipState.isMoving) {
            shipState.energy = 0;
            shipState.isMoving = false;
        }
    }
}

// More hooks might become available or necessary in the future.
// Remember to keep your everywhere.js file up to date with the latest version of the example everywhere.js file.

window.hook('before-adding-base-content', async function (menuHTML) {
    const headerElement = document.getElementById("header");
    if (!headerElement) {
        return;
    }

    headerElement.innerHTML = menuHTML;
});

window.hook('on-handle-route-change', async function () {
    // This hook will get triggered as soon as a route change is started.
});

window.hook('on-component-loaded', async function () {
    // This hook will get triggered, when a component is successfully loaded.
});

window.hook('on-content-loaded', async function () {
    // This hook will get triggered, when the content is displayed (i.e. of a component).
});

window.hook('get-popup-menu-html', async function (menuHTML) {
    return `
    <div id="menu" class="popup">
		<div class="menuList fade-left-menu">
            <br>
            ${menuHTML}
            <br>
			<button class="closePopup menu"><span class="material-icons md-light spaceRight">close</span>Close</button>
		</div>
	</div>
    `;
});

window.hook('page-loaded', async function () {
    await onPageLoaded();
});

async function onPageLoaded() {
    // Let's add some base content that will be included on every page.
    main.addBaseContent(`
    `);

    console.log('Page loaded');

    loadGameState();
    if (solarSystems.length <= 1) {
        generateSolarSystems(100);
    }

    setupEventListeners();

    GameLoop();
}

function setupEventListeners() {
    document.addEventListener('energyStateChanged', (event) => {
        if (shipState.energy <= 0) {
            main.alertPopup('Alert', 'Energy depleted');
        }
    });
}

window.hook('user-logged-in', async function () {
    // Triggered when a user is logged in
});

window.hook('add-markdown-patterns', async function (html) {
    // Let's add some custom markdown patterns
    const examplePattern = /\[example_pattern\]/g;

    // We can replcae the pattern with some HTML, even a with a whole component
    html = html.replace(examplePattern, 'Example');

    return html;
});

window.hook('create-routes', async function () {
    // Let's create some routes.
    // Each route type will be added to the menu, based on the user's role.
    // So the menuHTML will be different for the public and user. The admin is also a user.
    // Of course, you can also create routes conditionally, for example based on time of day or user role.
    // You can even overwrite routes. So if you create a route with the same path, the previously defined route will be overwritten.

    // The most common route is the public route, which is accessible by everyone.
    /* main.createPublicRoute('/example', 'Example Page', 'article', 'components/example.js', true, 'example-page');
    main.createPublicRoute('/example-inputs', 'Example Inputs', 'input', 'components/example-inputs.js', true); */

    // As we want something to view on our front page, let's reuse the example component, but not add it to the menu.
    main.createPublicRoute('/', 'Navigation', 'article', 'components/navigation.js', false);
    main.createPublicRoute('/index.html', 'Navigation', 'article', 'components/navigation.js', false);

    main.createPublicRoute('/navigation', 'Navigation', 'article', 'components/navigation.js', true);
    main.createPublicRoute('/ship-state', 'Ship State', 'settings', 'components/ship-state.js', true);
    main.createPublicRoute('/starmap', 'Star Map', 'map', 'components/starmap.js', true, true);
    main.createPublicRoute('/scanner', 'Scanner', 'search', 'components/scanner.js', true);
    main.createPublicRoute('/missions', 'Missions', 'list', 'components/mission-control.js', true);
    main.createPublicRoute('/settings', 'Settings', '', 'components/settings.js', true);
    /*  // We can also use the same component for different routes. But this time without an icon.
     main.createPublicRoute('/example-2', 'Also the Example Page', '', 'components/example.js', true);
 
     // The user route is only accessible by logged in users.
     main.createUserRoute('/example-for-users', 'Example Page for Users', 'account_circle', 'components/example.js', true);
 
     // The admin route is only accessible by logged in admins.
     main.createAdminRoute('/example-for-users', 'Example Page for Admins', 'admin_panel_settings', 'components/example.js', true); */
});

window.hook('get-cookies-list', async function () {
    // Let's add some default cookies to the list.

    let cookies = [
        'storageAcknowledgement',
        'lastUpdateNote',
        'PHPSESSID'
    ];

    return cookies;
});

window.hook('get-allowed-paths-during-maintenance', async function () {
    // Let's add some paths that are allowed during maintenance.

    let allowedPathsDuringMaintenance = [
        'login',
        'login-password',
        'logout',
        'contact',
        'privacy-policy',
        'terms-of-service'
    ];

    return allowedPathsDuringMaintenance;
});

window.hook('get-spa-excluded-links', async function () {
    // Let's add some routes that are excluded from the single page application route handling.

    let excludedRoutes = [
        'database/logout.php',
    ];

    return excludedRoutes;
});

window.hook('get-storage-acknowledgement-popup-content', async function () {
    // Let's add some content to the storage acknowledgement popup.

    const content = `
            <h1>Welcome!</h1>
			<p>By clicking "I Understand and Agree", you allow this site to store cookies on your device and use the browsers local storage. These following cookies and local storage entries are used to enable improve your experience:</p>
            <ul>
            <li>A cookie ensures that you won't see this message pop up on your subsequent visits or page reloads.</li>
            <li>Another cookie remembers which version of the website you last confirmed on the Update Notes, saving you from repeated update popups on every page load.</li>
            <li>Login will require a cookie and if you are logged in, additional cookies and local storage entries are used to provide further functionality.</li>
            </ul>
            <p>These cookies and the use of local storage entries are necessary for the smooth functioning of our site. If you choose to close this popup without clicking "I Understand and Agree", nothing will be stored. If you deny the permission, session storage will be used to hide this popup. Thank you for your understanding!</p>
        `;

    return content;
});

window.hook('generate-menu-html', async function (menuItems) {
    // Here you can modify how the menuHTML is generated from the menu items that are created with createPublicRoute, createUserRoute and createAdminRoute.

    return menuItems
        .map(item => {
            let classes = 'menuButton closePopup';
            let extraHTML = '';
            if (item.materialIcon != '') {
                let additionClass = item.hasName ? "spaceRight" : "";
                extraHTML = `<span class="material-icons ${additionClass}">${item.materialIcon}</span>`;
            }
            return `<a href="${item.path}" class="${classes} text-${item.displayFull}">${extraHTML}<span class="linkText">${item.name}</span></a>`;
        })
        .join('');
});

window.hook('fetch-user-data', async function () {
    // Let's return some default user data. Normally you would fetch this from a database.

    //You can try the different user examples by uncommenting them one by one.

    //Remember to set userLoginEnabled to true in config.js to enable the user login system.

    //Admin user
    /* const userData = {
        'loggedIn': true,
        'userId': '0',
        'username': 'Example Admin',
        'isAdmin': true,
        'isUser': true,
    }; */

    //Normal user
    /* const userData = {
        'loggedIn': true,
        'userId': '1',
        'username': 'Example User',
        'isAdmin': false,
        'isUser': true,
    }; */

    //Not logged in user
    const userData = {
        'loggedIn': false,
        'userId': '',
        'username': '',
        'isAdmin': false,
        'isUser': false,
    };

    return new Response(JSON.stringify(userData), {
        headers: { 'Content-Type': 'application/json' },
    });
});

window.hook('check-remember-me', async function () {
    // If your backend confirms that the user is remembered (i.e. Token accepted), return true.
    // Returning true here, will then reload the page.

    return false;
});

window.hook('get-maintenance-mode', async function () {
    // Here you would fetch the maintenance mode status from your backend.

    return false;
});

window.hook('add-dynamic-routes', async function (path) {
    // Here you can add some dynamic routes based on the path.
    // For example, you could add a route for each user, based on the user's ID. Or maybe you want to create blog posts that are fetched from a database.
    // These routes are only created when the user visits the path. So you can add a lot of dynamic routes without slowing down the initial page load. This also means, that they can not be added to the menu automatically.

    // In this example, we add a dynamic route with the example component.
    main.createPublicRoute('/dynamic-route', 'Dynamic Route', '', 'components/example.js', false, 'dynamic-route');

    return false;
});

window.hook('database-get-setting', async function (name, cacheSetting) {
    // Here you would fetch a setting from your backend.
    // In this example, we just return a default setting as a json response.

    return new Response(JSON.stringify({ value: 'exampleSetting' }), {
        headers: { 'Content-Type': 'application/json' },
    });
});

window.hook('database-set-setting', async function (name, value) {
    // Here you would set a setting in your backend.
    // In this example, we just return a success message as a json response.

    return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
    });
});

window.hook('send-analytics', async function (value) {
    // Here you would send analytics data to your backend.
    // In this example, we just log the value to the console.

    //console.log('Analytics:', value);
});

window.hook('validate-field', async function (input, value, errorElement, serverSide) {
    // This hook is triggered when a field is validated. You can use it to add custom validation rules.
    // If there are no errors, the error of the field will be cleared automatically if nothing or true is returned.

    if (input.name === 'exampleInput' && value.length != 8) {
        displayError(input, errorElement, 'Example input must be 8 characters long.');
        return false;
    }

    // You can also clear the error of another field (not the one that is currently being validated) by using the clearError(input, errorElement) function.

    if (serverSide) {
        // Here you can add server side validation. For example, you could check if a username already exists in your database.
        // The server side validation has a longer debounce to reduce the amount of requests to your server.

        /* const response = await checkUsernameExistence(value);
        if (response.exists) {
            displayError(input, errorElement, 'Username already exists.');
            return false;
        } */
    }

    //Please remember, that all input/textarea elements should have a label element surrounding them. This is needed for the automatic error message placement.
});

window.hook('get-loading-content', async function () {
    //This will be in the content section until the current component is loaded. You can place skeleton loaders or a loading symbol here or just return an empty string.

    return `
    <p>The page is loading...</p>
    `;
});