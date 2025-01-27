// NOTE: resource path we care about is /breeds/image/random/n returning { message: url[n] }
const STANFORD_DOG_DATASET_API = "https://dog.ceo/api";
// NOTE: usage: /?number=n returns n facts.
const DOG_FACT_ROOT_API_URL = "https://dog-api.kinduff.com/api";

// a little experiment to see if I can make a *blazingly fast* client-side ui
async function init()
{
    // TODO: consider firing off and not pausing further execution of this function, 
    // and performing manual synchronisation between any worker functions and hydration functions
    const dogCards = await acquireCardObjs();
    const readyState = document.readyState;
    console.log(`readystate: ${readyState}`);
    switch (readyState)
    {
        case "loading":
            document.addEventListener("DOMContentLoaded", hydrate.bind(dogCards));
            break;
        case "interactive":
        case "complete":
            hydrate(dogCards);
            break;
    };
}



/**
 * 
 * @returns {HTMLDivElement[]}
 */
function getAllCards() {
    const cardsQuery = document.querySelectorAll(".card");
    /**
     * @type {[HTMLDivElement]}
     */
    const cards = [];
    cardsQuery.forEach((val, _key, _parent) => {
        cards.push(val);
    });
    return cards;
}

// CREDIT: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
// If only the ECMAScript specification could expand upon the ranodmisation options in the language.
function _getRandomIntInclusive(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
}

function randomPositiveInt(max) {
    if (max === undefined || max === null || max === 0) max = 64;
    return _getRandomIntInclusive(0, max);
};
  
async function acquireCardObjs() 
{
    
    console.log("work started");
    const cards = getAllCards();
    /**
     * @type { {dogFacts: string[]; success: bool} }
     */
    const {facts, success} = await (
        await fetch(`${DOG_FACT_ROOT_API_URL}/facts?number=${cards.length}`)
    ).json();
    console.log(facts);
    
    const dogImages = await (
        await fetch(`${STANFORD_DOG_DATASET_API}/breeds/image/random/${cards.length}`)
    ).json();
    const dogCardObjs = await Promise.all(
        cards.map(
            async (_val, idx, _arr) => {
                const fact = facts[idx];
                const imageUrl = dogImages["message"][idx];
                return {fact, imageUrl};
            }
        )
    );

    return dogCardObjs;
}

function hydrate(cardObjs)
{
    console.log("hydration initiated with: ", cardObjs);
    const cards = document.querySelectorAll(".card");
    cards.forEach((val, _key, _parent) => {
        console.log(val);
        /**
         * @type { [HTMLImageElement, HTMLParagraphElement] }
         */
        const [img, text] = val.children;
        try {
            const {fact, imageUrl} = cardObjs.pop();
            console.log(fact, imageUrl);
            img.src = imageUrl;
            text.textContent = fact;
        } catch (error) {
            console.error(error);
        }
    });
}

init();