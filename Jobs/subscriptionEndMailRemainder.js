const cron = require('node-cron');
const { sendSubscriptionEndingReminder } = require('../Utils/mailSender');
const { TenantSchemas } = require('../Utils/dbSchemas');
const { getCollection } = require('../Utils/dbHelper');

const subscriptionEndRemainderMail = async () => {

    cron.schedule('0 0 * * * *', async () => {
        try {
            const Manager = await getCollection("AppTenants", "tenant", TenantSchemas)
            console.log("Running subscription mail send job...");

            const managersToMail = await Manager.find({
                subscribed: true,
            });

            if (managersToMail.length > 0) {

                const today = new Date();

                for (const manager of managersToMail) {

                    const remainingDays = Math.ceil((manager.subscriptionEnd - today) / (1000 * 60 * 60 * 24));

                    if (remainingDays <= 7) {
                        // Send mail reminder
                        sendSubscriptionEndingReminder(manager.companyEmail, manager.companyName, remainingDays)
                        console.log(`Send mail to manager ${manager._id}: Subscription ending in ${remainingDays} days.`);
                    }
                }
            }

            console.log('Subscription update job completed.');
        } catch (error) {
            console.error('Error in subscription update job:', error);
        }
    });

}

module.exports = {
    subscriptionEndRemainderMail
}
