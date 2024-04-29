const { query } = require('express');
const connectDB = require('../Configurations/dbConfig');
const { modelName } = require('../Models/Otp');

const switchDB = async (dbName, dbSchema) => {

    const mongoose = await connectDB()

    if (mongoose.connection.readyState === 1) {
        const db = await mongoose.connection.useDb(dbName)
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
    return db.model(modelName)
    // return the collection we want
}

const getCollection = async (dbName, modelName, dbSchema) => {
    const db = await switchDB(dbName, dbSchema)
    const collection = await getDBModel(db, modelName)
    return collection
}

          
const getDocument = async (query, collectionName, dbname, schemas) => {
    try {

        const tenantDB = await switchDB(dbname, schemas);
        const Collection = await getDBModel(tenantDB, collectionName);
        const item = await Collection.findOne(query);
        // Using findOne to get a single document
        return item; // Return the found tenant document
    } catch (error) {
        console.error('Error getting tenant in document', error);
        return null; // Return null if there's an error
    }
};

const getDocumentWithPopulate = async (query, collectionName, dbname, schemas, populate) => {
    try {

        const tenantDB = await switchDB(dbname, schemas);
        const Collection = await getDBModel(tenantDB, collectionName);
        const item = await Collection.find(query).populate(populate) // Using findOne to get a single document
        return item; // Return the found tenant document
    } catch (error) {
        console.error('Error getting tenant in populate', error);
        return null; // Return null if there's an error
    }
};

const getDocuments = async (query, collectionName, dbname, schemas) => {
    try {

        const tenantDB = await switchDB(dbname, schemas);
        const Collection = await getDBModel(tenantDB, collectionName);
        const item = await Collection.find(query); // Using findOne to get a single document
        return item; // Return the found tenant document
    } catch (error) {
        console.error('Error getting tenant in documents', error);
        return null; // Return null if there's an error
    }
};

const deleteDocument = async (query, collectionName, dbname, schemas) => {
    try {
        const tenantDB = await switchDB(dbname, schemas);
        const Collection = await getDBModel(tenantDB, collectionName);
        const item = await Collection.deleteOne(query); // Using findOne to get a single document
        return item; // Return the found tenant document
    } catch (error) {
        console.error('Error getting tenant in documents', error);
        return null; // Return null if there's an error
    }
};

module.exports = {
    switchDB,
    getDBModel,
    getDocument,
    getDocuments,
    getDocumentWithPopulate,
    deleteDocument,
    getCollection
}