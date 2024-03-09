import { playerState, shipState, starSystems, factions } from "../../everywhere.js";

const emptySpace = {
    name: "Empty Space",
    coordinates: { x: 0, y: 0 },
    discovered: true,
    planets: []
};

export function generateFactions(number) {
    for (let i = 0; i < number; i++) {
        const name = generateUniqueName(5, 1);
        //To Do: Add 'Empire'...
        const color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
        const alliedWith = [];
        const warWith = [];

        factions.push({
            name,
            color,
            alliedWith,
            warWith
        });
    }
}

export function generateStarSystems(number) {
    const maxDistance = 1000;
    const planetTypes = ['Terrestrial', 'Gas Giant', 'Ice Giant', 'Dwarf'];
    const faunaTypes = ['None', 'Sparse', 'Abundant', 'Diverse'];
    const floraTypes = ['None', 'Sparse', 'Abundant', 'Diverse'];
    const civilizationTypes = ['None', 'Primitive', 'Advanced', 'Highly Advanced'];

    for (let i = 0; i < number; i++) {
        const name = generateUniqueName(4, 1);
        const coordinates = {
            x: Math.floor(Math.random() * maxDistance) * (Math.random() < 0.5 ? -1 : 1),
            y: Math.floor(Math.random() * maxDistance) * (Math.random() < 0.5 ? -1 : 1)
        };

        let planets = Array.from({ length: Math.max(1, Math.floor(Math.random() * 10)) }, () => ({
            name: generateUniqueName(4, Math.floor(Math.random() * 2) + 1),
            type: planetTypes[Math.floor(Math.random() * planetTypes.length)],
            fauna: faunaTypes[Math.floor(Math.random() * faunaTypes.length)],
            flora: floraTypes[Math.floor(Math.random() * floraTypes.length)],
            population: Math.floor(Math.random() * 1000000),
            civilization: civilizationTypes[Math.floor(Math.random() * civilizationTypes.length)]
        }));

        planets = planets.sort((a, b) => a.name.localeCompare(b.name));
        let discovered = false;
        let faction = null;
        if (Math.random() < 0.25) {
            faction = factions[Math.floor(Math.random() * factions.length)].name;
            if (faction === 'Federation') {
                discovered = true;
            }
        }

        starSystems.push({
            name,
            coordinates,
            discovered,
            planets,
            faction
        });
    }

    starSystems.sort((a, b) => {
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
    'bu', 'nu', 'du', 'ru', 'ku', 'su', 'tu', 'lu', 'pu', 'mu', 'gu', 'hu', 'ju', 'zu', 'cu', 'vu', 'fu', 'yu', 'wu', 'xu',
    'ab', 'ac', 'ad', 'af', 'ag', 'ah', 'aj', 'ak', 'al', 'am', 'an', 'ap', 'aq', 'ar', 'as', 'at', 'av', 'aw', 'ax', 'ay', 'az',
    'eb', 'ec', 'ed', 'ef', 'eg', 'eh', 'ej', 'ek', 'el', 'em', 'en', 'ep', 'eq', 'er', 'es', 'et', 'ev', 'ew', 'ex', 'ey', 'ez',
    'ib', 'ic', 'id', 'if', 'ig', 'ih', 'ij', 'ik', 'il', 'im', 'in', 'ip', 'iq', 'ir', 'is', 'it', 'iv', 'iw', 'ix', 'iy', 'iz',
    'ob', 'oc', 'od', 'of', 'og', 'oh', 'oj', 'ok', 'ol', 'om', 'on', 'op', 'oq', 'or', 'os', 'ot', 'ov', 'ow', 'ox', 'oy', 'oz',
    'ub', 'uc', 'ud', 'uf', 'ug', 'uh', 'uj', 'uk', 'ul', 'um', 'un', 'up', 'uq', 'ur', 'us', 'ut', 'uv', 'uw', 'ux', 'uy', 'uz',
    'bat', 'net', 'dim', 'rot', 'kix', 'sax', 'tob', 'lev', 'pum', 'mox', 'gab', 'hut', 'jiz', 'zep', 'cuv', 'vex', 'fop', 'yik', 'wun', 'xol',
    'bar', 'ned', 'dil', 'ron', 'kib', 'sal', 'ton', 'led', 'pok', 'mig', 'gal', 'hob', 'jun', 'zod', 'cag', 'vol', 'fud', 'yup', 'waz', 'xif',
];

function generateUniqueName(maxNumSyllables, numWords, attempt = 0) {
    let name = '';
    for (let i = 0; i < numWords; i++) {
        let word = '';
        let numSyllables = Math.floor(Math.random() * maxNumSyllables) + 1;
        for (let j = 0; j < numSyllables; j++) {
            word += syllables[Math.floor(Math.random() * syllables.length)];
        }
        if (shipState.generatedNames.includes(word)) {
            if (attempt > 200) {
                throw new Error('Failed to generate a unique name');
            }
            return generateUniqueName(maxNumSyllables, numWords, attempt + 1);
        } else {
            shipState.generatedNames.push(word);
            word = word.charAt(0).toUpperCase() + word.slice(1);
            name += word + ' ';
        }
    }
    return name.trim();
}