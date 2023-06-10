import { catalystType } from "./enum.js";

const probabilities = {
    common: 60,
    rare: 25,
    epic: 10,
    legendary: 5,
};
export function openLootBox() {
    const totalProbability = Object.values(probabilities).reduce((total, num) => total + num, 0);

    const randomNumber = Math.random() * totalProbability;

    let catalyst;

    if (randomNumber <= probabilities.legendary) {
        catalyst = catalystType.LEGENDARY
    }
    else if (randomNumber <= probabilities.epic + probabilities.legendary) {
        catalyst = catalystType.EPIC
    }
    else if (randomNumber <= probabilities.rare + probabilities.epic + probabilities.legendary) {
        catalyst = catalystType.RARE
    }

    else catalyst = catalystType.COMMON

    return catalyst;

}

// function simulateOpeningLootBoxes(numSimulations) {
//     console.log(`simulate open loot box ${numSimulations} times`)
//     const results = {};

//     for (let i = 0; i < numSimulations; i++) {
//         const item = openLootBox();
//         // console.log(item)
//         if (!results[item.rarity]) {
//             results[item.rarity] = 0;
//         }
//         results[item.rarity]++;
//     }
//     console.log(results)
//     for (const rarity in results) {
//         const probability = (results[rarity] / numSimulations) * 100;
//         console.log(`${rarity}: ${probability.toFixed(2)}%`);
//     }
// }

// simulateOpeningLootBoxes(10000000);
