const mongoose = require('mongoose')

const createDynamicModel = (collectionName, schemaDefinition) => {
    schemaDefinition["customerId"] = {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer"
    }
    const dynamicBookingSchema = new mongoose.Schema(schemaDefinition)
    return mongoose.model(collectionName, dynamicBookingSchema)
}

module.exports = createDynamicModel

