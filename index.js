const fs = require('fs');
const path = require('path');

let setResearchLow = true;
let researchAmount = 2;

let allowAllLevelsForAllSlots = true;
let setCostsToLow = true;
let lowCostAmount = 1;
let slotSizeForEachUnit = 10;
let slowSizeForInfControl = 50;

// show hidden premium units
let enablePremiumForAll = true;

// will turn on features that offline supports
let isOffline = true;

// will add new slots to all divisions (a7, b7, c7) Level 6
let addNewSlotsToAll = true;

// which ones you want supported
const paths = ["ger", "rus", "usa"]
// const paths = ["ger", ]
const outputPath = "sean-mods"
// edit units
paths.forEach((pathstr) => {

    // Path to the JSON file `./global/backend/meta/unitTemplate/${pathstr}.json`
    const jsonFilePath = path.join(__dirname, `./units/${pathstr}.json`);
    const jsonFilePathOut = path.join(__dirname, `./${outputPath}/global/backend/meta/unitTemplate/${pathstr}.json`);

    // Read and parse the JSON file
    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the JSON file:', err);
            return;
        }

        let jsonData;
        try {
            jsonData = JSON.parse(data);
        } catch (parseErr) {
            console.error('Error parsing JSON data:', parseErr);
            return;
        }

        // Process each record in the JSON data
        jsonData.forEach(record => {
            //!Not for online mode
            if (isOffline) {
                if (record.amount_slot < slotSizeForEachUnit) {
                    record.amount_slot = slotSizeForEachUnit;
                }
            }

            if (record.battle_rank > 20) {
                record.battle_rank = 20;
            }
            // !Not for online mode
            if (isOffline) {

                if (record.silver_base > lowCostAmount && setCostsToLow) {
                    record.silver_base = lowCostAmount;
                }
                if (record.silver_cost > lowCostAmount && setCostsToLow) {
                    record.silver_cost = lowCostAmount;
                }

                if (setResearchLow) {
                    if (record.xp_base > researchAmount) {
                        record.xp_base = researchAmount;
                    }
                    if (record.xp_open > researchAmount) {
                        record.xp_open = researchAmount;
                    }
                }
            }

            if (enablePremiumForAll) {
                record.hidden = false;
                record.premium = false;
                record.premium_gold = 0;
                record.collectible = false;
                record.silver_rate = 999;
            }
            for (const key in record.campaign) {
                if (record.campaign.hasOwnProperty(key)) {
                    // change this and online will not let you buy anything! !Not for online mode
                    // !Not for online mode
                    if (isOffline) {
                        record.campaign[key].silver_cost = 1;
                    }
                    record.campaign[key].collectible = false;
                    record.campaign[key].hidden = false;
                    record.campaign[key].premium = false;
                    if (setResearchLow && isOffline) {
                        if (record.campaign[key].xp_base > researchAmount) {
                            record.campaign[key].xp_base = researchAmount;
                        }
                        if (record.campaign[key].xp_open > researchAmount) {
                            record.campaign[key].xp_open = researchAmount;
                        }
                    }
                }
            }
            // !Not for online mode
            if (isOffline) {
                if (record.mm_type === "inf_control") {
                    record.amount_slot = slowSizeForInfControl;
                }
            }

        });

        // Write the modified JSON data back to the file
        fs.writeFile(jsonFilePathOut, JSON.stringify(jsonData, null, 2), 'utf8', writeErr => {
            if (writeErr) {
                console.error('Error writing to the JSON file:', writeErr);
            } else {
                console.log('JSON file has been updated successfully.');
            }
        });
    });
})
// edit commander 

paths.forEach((pathstr) => {

    // Path to the JSON file `./global/backend/meta/unitTemplate/${pathstr}.json`
    const jsonFilePath = path.join(__dirname, `./commander/${pathstr}.json`);
    const jsonFilePathOut = path.join(__dirname, `./${outputPath}/global/backend/meta/commanderTemplate/${pathstr}.json`);

    // Read and parse the JSON file
    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the JSON file:', err);
            return;
        }

        let jsonData;
        try {
            jsonData = JSON.parse(data);
        } catch (parseErr) {
            console.error('Error parsing JSON data:', parseErr);
            return;
        }

        // Get Data prep for new Slot
        const first = jsonData.filter(x => x.slot)[0]
        const firstSlot = first.slot['a1'].squad
        let allSubTypes = []
        jsonData.forEach(record => {
            for (const slot in record.slot) {
                if (record.slot.hasOwnProperty(slot)) {
                    const tmpSlotTypes = record.slot[slot].subtype;
                    allSubTypes.push(...tmpSlotTypes)
                }
            }
        });

        const uniqueSubTypes = [...new Set(allSubTypes)];
        allSubTypes = [
            "inf_ai",
            "inf_basic",
            "inf_paratrooper",
            "inf_heavy"
        ]
        const newSlot = {
            "echelon": 1,
            "level": 6,
            "squad": firstSlot,
            "subtype": uniqueSubTypes
        }

        // Process each record in the JSON data
        jsonData.forEach(record => {
            record.echelon_battle_rank = [800, 800, 800]
            for (const slot in record.slot) {
                if (record.slot.hasOwnProperty(slot) && allowAllLevelsForAllSlots) {
                    record.slot[slot].level = 6;
                }
            }
            if (record.slot && addNewSlotsToAll) {
                record.slot['a7'] = newSlot;
                record.slot['b7'] = { ...newSlot };
                record.slot['b7'].echelon = 2;
                record.slot['c7'] = { ...newSlot };
                record.slot['c7'].echelon = 3;
            }
        });

        // Write the modified JSON data back to the file
        fs.writeFile(jsonFilePathOut, JSON.stringify(jsonData, null, 2), 'utf8', writeErr => {
            if (writeErr) {
                console.error('Error writing to the JSON file:', writeErr);
            } else {
                console.log('JSON file has been updated successfully.');
            }
        });
    });
})
