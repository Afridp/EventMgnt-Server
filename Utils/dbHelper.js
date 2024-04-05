const connectDB = require('../Configurations/dbConfig');



const Customer = require('../Models/Customer')
const Manager = require('../Models/Manager')
const Otp = require('../Models/Otp')
const Event = require('../Models/Event')
const Booking = require('../Models/Booking');
const Employees = require('../Models/Employee')
const Employee = require('../Models/Employee');
const Form = require('../Models/Form');
const FormSubmissions = require('../Models/FormSubmissions');
const Wallet = require('../Models/Wallet');

const tenantSchema = require('../Models/Tenants');



const TenantSchemas = new Map([['tenant', tenantSchema]])


const switchDB = async (dbName, dbSchema) => {

    const mongoose = await connectDB()

    if (mongoose.connection.readyState === 1) {
        const db = mongoose.connection.useDb(dbName, { useCache: true })
        // Prevent from schema re-registration
        if (!Object.keys(db.models).length) {

            dbSchema.forEach((schema, modelName) => {

                db.model(modelName, schema)
            })
        }
        return db
    }
    throw new Error('err')
}
// modelName === collectionName
const getDBModel = async (db, modelName) => {
    // return the collection we want 
    return db.model(modelName)
}            

const getDocument = async (query, collectionName, dbname) => {
    try {
        
        const tenantDB = await switchDB(dbname, TenantSchemas);
        const Collection = await getDBModel(tenantDB, collectionName);
        const item = await Collection.findOne(query); // Using findOne to get a single document
        return item; // Return the found tenant document
    } catch (error) {
        console.error('Error getting tenant:error....is not logged');
        return null; // Return null if there's an error
    }
};

const getDocuments = async (query, collectionName, dbname) => {
    try {
        
        const tenantDB = await switchDB(dbname, TenantSchemas);
        const Collection = await getDBModel(tenantDB, collectionName);
        const item = await Collection.find(query); // Using findOne to get a single document
        return item; // Return the found tenant document
    } catch (error) {
        console.error('Error getting tenant:error....is not logged');
        return null; // Return null if there's an error
    }
};

module.exports = {
    switchDB,
    getDBModel,
    getDocument,
    getDocuments
}