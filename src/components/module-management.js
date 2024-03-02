import { updateTitleAndMeta, action } from "../../Birdhouse/src/main.js";
import { shipState, solarSystems, formatCamelCase } from "../../everywhere.js";
import * as modules from "../../src/game/modules.js";

export default async function ModuleManagement() {
    action(initializeModules);
    action({
        type: 'updateUI',
        handler: updateModuleUI
    });

    return `
    <div id="module-management" class="panel">
        <h2>Module Management</h2>
        <p><strong>Warning:</strong> Disabling some modules may cause loss of ressources like fuel or energy.</p>
        <div class="panelRow" id="modules-container"></div>
    </div>
    `;
}

function initializeModules() {
    const modulesContainer = document.getElementById('modules-container');
    modulesContainer.innerHTML = '';

    shipState.modules.forEach((module, index) => {
        const moduleElement = document.createElement('div');
        moduleElement.classList.add('panel');
        let propertiesHTML = Object.entries(module.properties).map(([propName, propValue]) => {
            return `<p id="${propName}-${index}"> ${formatProperty(propName, propValue)}</p>`;
        }).join('');

        moduleElement.innerHTML = `
            <h3>${module.name}</h3>
            <p>Weight: ${module.weight}</p>
            <p id="health-${index}">Health: ${module.currentHealth}/${module.maxHealth}</p>
            <p id="status-${index}">Status: ${module.enabled ? 'Enabled' : 'Disabled'}</p>
            ${propertiesHTML}
        `;

        const actionsContainer = document.createElement('div');
        actionsContainer.classList.add('buttonPanel');

        // Enable/Disable button
        const enableDisableButton = document.createElement('button');
        enableDisableButton.id = `enable-disable-${index}`;
        enableDisableButton.classList.add('colored');
        enableDisableButton.textContent = module.enabled ? 'Disable' : 'Enable';
        enableDisableButton.addEventListener('click', () => {
            if (module.enabled) {
                module.onDisable();
            } else {
                module.onEnable();
            }
            updateModuleUI();
        });
        actionsContainer.appendChild(enableDisableButton);

        Object.entries(module.functions).forEach(([funcName, { action, friendlyName }]) => {
            const actionButton = document.createElement('button');
            actionButton.textContent = friendlyName;
            actionButton.classList.add('colored');
            actionButton.addEventListener('click', () => {
                action();
                updateModuleUI();
            });
            actionsContainer.appendChild(actionButton);
        });

        moduleElement.appendChild(actionsContainer);
        modulesContainer.appendChild(moduleElement);
    });
}

function updateModuleUI() {
    shipState.modules.forEach((module, index) => {
        const healthElement = document.getElementById(`health-${index}`);
        if (healthElement) {
            healthElement.innerHTML = `Health: ${module.currentHealth}/${module.maxHealth}`;
        }

        const statusElement = document.getElementById(`status-${index}`);
        if (statusElement) {
            statusElement.innerHTML = `Status: ${module.enabled ? 'Enabled' : 'Disabled'}`;
        }

        const enableDisableButton = document.getElementById(`enable-disable-${index}`);
        if (enableDisableButton) {
            enableDisableButton.textContent = module.enabled ? 'Disable' : 'Enable';
        }

        displayModuleProperties(module, index)
    });
}

function displayModuleProperties(module, moduleIndex) {
    Object.entries(module.properties).forEach(([propName, propValue]) => {
        const propertyElement = document.getElementById(`${propName}-${moduleIndex}`);
        if (propertyElement) {
            propertyElement.innerHTML = formatProperty(propName, propValue);
        }
    });
}

function formatProperty(propName, propValue) {
    const formattedName = formatCamelCase(propName);
    propValue = typeof propValue === 'boolean' ? (propValue ? 'Yes' : 'No') : propValue;
    return `${formattedName}: ${propValue}`;
}