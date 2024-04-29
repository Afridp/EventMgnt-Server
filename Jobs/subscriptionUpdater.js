const cron = require('node-cron');
const { getCollection } = require('../Utils/dbHelper');
const { TenantSchemas } = require('../Utils/dbSchemas');

// Function to initialize and start the cron job
const startSubscriptionUpdateJob = async () => {
    // Define a cron job to run every minute (for testing purposes)
    cron.schedule('0 0 * * * *', async () => {
        try {
            const Manager = await getCollection("AppTenants", "tenant", TenantSchemas)
            console.log("Running subscription update job...");

            // Find managers with active subscriptions that have ended
            const managersToUpdate = await Manager.find({
                subscribed: true,
                subscriptionEnd: { $lte: new Date() } // Check for end dates that have passed
            });
            if (managersToUpdate.length > 0) {

                // Update the subscribed field for each manager
                for (const manager of managersToUpdate) {
                    // Update the subscribed field to false
                    manager.subscribed = false;
                    await manager.save();
                    console.log(`Manager subscription updated: ${manager._id}`);
                }

            }
            console.log('Subscription update job completed.');
        } catch (error) {
            console.error('Error in subscription update job:', error);
        }
    });
};

// Export the function to start the cron job
module.exports = {
    startSubscriptionUpdateJob
};
