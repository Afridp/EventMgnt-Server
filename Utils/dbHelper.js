const { query } = require('express');
const connectDB = require('../Configurations/dbConfig');
const { modelName } = require('../Models/Otp');
const { mongoose } = require('mongoose');

// const switchDB = async (dbName, dbSchema) => {
//     try {
//         // Connect to the default database or the specified one
//         const conn = await connectDB(); // Assuming this function connects to the default database

//         if (conn.readyState === 1) {
//             const db = mongoose.connection.useDb(dbName, { useCache: true }); // `useCache: true` prevents re-opening of connections

//             // Prevent schema re-registration
//             if (!Object.keys(db.models).length) {
//                 dbSchema.forEach((schema, modelName) => {
//                     db.model(modelName, schema);
//                 });
//             }
//             // if (!Object.keys(db.models).length) {
//             //     Object.entries(dbSchema).forEach(([modelName, schema]) => {
//             //       db.model(modelName, schema);
//             //     });
//             //   }
//             console.log(`Switched to database: ${dbName}`);
//             return db;
//         } else {
//             throw new Error('Mongoose connection is not ready');
//         }
//     } catch (err) {
//         console.error(`Failed to switch to database ${dbName}:`, err);
//         throw new Error(`Database switch failed: ${err.message}`);
//     }
// };

const switchDB = async (dbName, dbSchema) => {
    try {
        // Ensure we have a connection
        if (mongoose.connection.readyState !== 1) {
            await connectDB();
        }

        const db = mongoose.connection.useDb(dbName, { useCache: true });

        // Prevent schema re-registration
        if (!Object.keys(db.models).length) {
            dbSchema.forEach((schema, modelName) => {
                db.model(modelName, schema);
            });
        }

        console.log(`Switched to database: ${dbName}`);
        return db;
    } catch (err) {
        console.error(`Failed to switch to database ${dbName}:`, err);
        throw new Error(`Database switch failed: ${err.message}`);
    }
};

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