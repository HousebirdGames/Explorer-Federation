import { updateTitleAndMeta } from "../../Birdhouse/src/main.js";
import { shipState, starSystems } from "../../everywhere.js";
import ShipState from './ship-state.js';
import ModuleManagement from "./module-management.js";

export default async function Engineering() {
    updateTitleAndMeta('Navigation', 'Control the navigation of your ship');

    return `
    <h1>Engineering</h1>
    ${await ShipState()}
    ${await ModuleManagement()}
`;
}