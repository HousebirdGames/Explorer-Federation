import { updateTitleAndMeta } from "../../Birdhouse/src/main.js";
import { shipState, solarSystems } from "../../everywhere.js";
import CourseSelection from "./course-selection.js";
import NavigationDisplay from "./navigation-display.js";
import SpeedControl from "./speed-control.js";
import StarMap from "./starmap.js";
import Log from "./log.js";

export default async function Navigation() {
    updateTitleAndMeta('Navigation', 'Control the navigation of your ship');

    return `
    <h1>Navigation</h1>
    ${await Log('Comms', 1)}
    ${await StarMap()}
    ${await NavigationDisplay()}
    ${await Log('Helms', 3)}
    ${await SpeedControl()}
    ${await CourseSelection()}
`;
}