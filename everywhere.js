// Required imports
import * as main from "./Birdhouse/src/main.js";
import { displayError, clearError } from "./Birdhouse/src/modules/input-validation.js";
import { startGameLoop } from "./src/game/game-loop.js";
import { loadGameState, saveGameState, initialStarSystem, initialFactions } from "./src/game/state.js";

export let currentFramerate = 60;
export let deltaTime = 0;

export function setDeltaTime(time) {
    deltaTime = time;
}

export let playerState = {};

export const defaultSettings = {
    framerate: 60,
    chunkyAnimations: true
};

export let settings = defaultSettings;

export let shipState = {};

export let npcShips = [];

export let factions = initialFactions;

export let starSystems = [initialStarSystem];

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
    loadGameState();

    currentFramerate = (settings.framerate ? settings.framerate : 60);

    saveGameState();
});

window.hook('on-component-loaded', async function () {
    // This hook will get triggered, when a component is successfully loaded.
    setTimeout(updateButtonsColor, 0);
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

window.hook('before-actions-setup', async function () {
    main.action(updateHeadingsColor);

    main.action({
        type: 'updateUI',
        handler: () => {
            updateButtonsColor();
            updateHeadingsColor();
        }
    });
    main.action({
        type: 'click',
        handler: (event) => {
            updateButtonColor(event.target);
        },
        selector: 'button.colored'
    });
});

function updateHeadingsColor() {
    const headings = document.querySelectorAll('.panel h3, .panel h4, .panel h5, .panel h6');
    headings.forEach(heading => {
        const text = heading.textContent || heading.innerText;
        const bgColor = stringToColor(text);
        heading.style.backgroundColor = bgColor;
        //heading.style.color = (parseInt(bgColor.replace('#', ''), 16) > 0xffffff / 2) ? 'black' : 'white';
    });
}

function updateButtonsColor() {
    const buttons = document.querySelectorAll('button.colored');
    buttons.forEach(button => {
        updateButtonColor(button);
    });
}

function updateButtonColor(button) {
    const text = button.textContent || button.innerText;
    const color = stringToColor(text);
    button.style.backgroundColor = color;
    //button.style.color = (parseInt(color.replace('#', ''), 16) > 0xffffff / 2) ? 'black' : 'white';
}


const colorPalette = [
    '#E57373', '#F06292', '#BA68C8', '#9575CD', '#7986CB',
    '#64B5F6', '#4FC3F7', '#4DD0E1', '#4DB6AC', '#81C784',
    '#AED581', '#DCE775', '#FFF176', '#FFD54F', '#FFB74D',
    '#FF8A65', '#A1887F', '#E0E0E0', '#90A4AE'
];

function stringToColorIndex(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
    }
    hash = Math.abs(hash);
    return hash % colorPalette.length;
}

function stringToColor(str) {
    const index = stringToColorIndex(str);
    return colorPalette[index];
}

function stringToRandomColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        const lightened = Math.min(255, value + 84).toString(16);
        color += lightened.padStart(2, '0');
    }
    return color;
}

window.hook('page-loaded', async function () {
    await onPageLoaded();
});

async function onPageLoaded() {
    main.addBaseContent(`
    
    `);

    if (settings.chunkyAnimations) {
        main.loadCSS('chunky.css');
    }
    else {
        main.removeCSS('chunky.css');
    }

    console.log('Page loaded');

    startGameLoop();
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
    main.createPublicRoute('/', 'Bridge', 'star', 'components/bridge', false);
    main.createPublicRoute('/index.html', 'Bridge', 'star', 'components/bridge', false);
    main.createPublicRoute('/bridge', 'Bridge', 'star', 'components/bridge', true);

    main.createPublicRoute('/navigation', 'Navigation', 'article', 'components/navigation', true);
    main.createPublicRoute('/tactical', 'Tactical', 'article', 'components/tactical', true);
    main.createPublicRoute('/engineering', 'Engineering', 'settings', 'components/engineering', true);
    main.createPublicRoute('/ship-state', 'Ship State', 'settings', 'components/ship-state', false);
    main.createPublicRoute('/starmap', 'Star Map', 'map', 'components/starmap', true, true);
    main.createPublicRoute('/scanner', 'Scanner', 'search', 'components/scanner', true);
    main.createPublicRoute('/missions', 'Missions', 'list', 'components/mission-control', true);
    main.createPublicRoute('/logs', 'Logs', 'list', 'components/logs', true);
    main.createPublicRoute('/settings', 'Settings', 'settings', 'components/settings', true);
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

    if (input.id === 'framerateSlider' && input.value != currentFramerate) {
        displayError(input, errorElement, `Reload the page to apply the changes.`);
        return false;
    }

    if (input.id === 'chunkyAnimations') {
        displayError(input, errorElement, `Reload the page to apply the changes.`);
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
    
    `;
});