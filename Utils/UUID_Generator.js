const Event = require('../Models/Event');
const Manager = require('../Models/Manager') // Set to store generated UUIDs

async function generateManagerUUID() {
    let uuid;
    let isUnique = false;
    // Loop until a unique UUID is generated
    while (!isUnique) {
        // Generate a random number with 4 digits
        const randomNumber = Math.floor(1000 + Math.random() * 9000);

        // Construct the UUID with the "MR" prefix and the random number
        uuid = `MR${randomNumber}`;

        // Check if the UUID exists in the database
        const existingManager = await Manager.findOne({ uuid });

        // If no manager with the same UUID is found, it's unique
        if (!existingManager) {
            isUnique = true;
        }
    }
    return uuid;
}

async function generateEventUUID(managerUUID) {
    let uuid;
    let isUnique = false;

    while (!isUnique) {
        // Generate a random number with 4 digits
        const randomNumber = Math.floor(100 + Math.random() * 900);

        // Construct the UUID with the "MR" prefix and the random number
        uuid = `${managerUUID}-EV${randomNumber}`;

        // Check if the UUID exists in the database
        const existingEvent = await Event.findOne({ uuid });

        // If no manager with the same UUID is found, it's unique
        if (!existingEvent) {
            isUnique = true;
        }
    }
    return uuid;
}

module.exports = {
    generateManagerUUID,
    generateEventUUID
}