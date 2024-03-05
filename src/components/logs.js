import { updateTitleAndMeta, action } from "../../Birdhouse/src/main.js";
import Log from "./log.js";

export default async function Logs() {
    return `
<h1>Logs</h1>
<div class="panel">
${await Log('Captain', 2)}
${await Log(null, 10)}
</div>
`;
}