// USING INDEXED DATABASE

import { seedDB } from "./data/loadData";
import { once, runOnComplete } from "./utils";

// global table database
let DB;

export let loadedDB = false;
export const dbEvent = 'loadedDatabase';
export const dbName = 'messages_db';

// open a new indexeddb 
const IDBrequest = indexedDB.open(dbName, 1);


export const openTrans = (db, tb, mode) => db.transaction(tb, mode).objectStore(tb);


export const IDBPromise = req =>
    new Promise((res, rej) => {
        req.onsuccess = _ => res(req.result);
        req.onerror = _ => rej(req.error);
    })




export const chatsTable = 'people_chats_tb';
export const msgsTable = 'all_messages_tb';
export const offlineMsgsTable = 'offline_messages';
export const contactsTable = 'people_tb';
export const filesTable = 'files';


// listen for any errors from opening the indexeddb
IDBrequest.onerror = e => {
    if (IDBrequest.constructor.name === "IDBOpenDBRequest")
        console.error("Why didn't you allow my web app to use IndexedDB?!")
    else
        console.error(`Database error: ${e.target.error}`);
}


export function restartIDB() {
    DB?.close();
    let deleteRequest = indexedDB.deleteDatabase("messages_db");
    deleteRequest.onsuccess = _ => {
        loadedDB = false;
        console.log("Successfully closed indexeddb");
    }
}


// listen for any errors from opening the indexeddb
IDBrequest.onblocked = _ => {
    DB?.close();
    alert("Database is outdated, please reload the page.");
}


// if we upgrade (create new database or add or remove columns and overwrie former database)
IDBrequest.onupgradeneeded = e => {
    DB = e.target.result;
    if (e.oldVersion > 0) {
        console.log(
            `Update needed
            Clearing old version .....`
        );

        // delete all object stores first
        for (let store of DB.objectStoreNames) {
            console.log("Deleting " + store + " store");
            DB.deleteObjectStore(store);
        }
    }

    // handle errors
    DB.onerror = _ => console.error('Error loading database.');

    if (!DB.objectStoreNames.contains(msgsTable)) {
        // create a table (object store) in athe database and add columns(object indices)
        let messagesTable = DB.createObjectStore(msgsTable, { keyPath: 'id' });
        messagesTable.createIndex('timestamp', 'timestamp', { unique: false });
        messagesTable.createIndex('handle', 'handle', { unique: false });
    }
    if (!DB.objectStoreNames.contains(chatsTable)) {
        // create a table (object store) in athe database and add columns(object indices)
        let peopleChatsTable = DB.createObjectStore(chatsTable, { keyPath: 'handle' });
        // peopleChatsTable.createIndex('unread', 'unread', {unique: false});
    }
    if (!DB.objectStoreNames.contains(contactsTable)) {
        // create a table (object store) in athe database and add columns(object indices)
        let peopleTable = DB.createObjectStore(contactsTable, { keyPath: 'handle' });
    }
    if (!DB.objectStoreNames.contains(offlineMsgsTable)) {
        // create a table (object store) in athe database and add columns(object indices)
        let offlineMessages = DB.createObjectStore(offlineMsgsTable, { autoIncrement: true });
        offlineMessages.createIndex('handle', 'handle', { unique: false });
    }
    // if (!DB.objectStoreNames.contains("offline_tasks")) {
    //     // create a table (object store) in athe database and add columns(object indices)
    //     let undone = DB.createObjectStore('offline_tasks', { autoIncrement: true });
    //     undone.createIndex('taskType', 'taskType', { unique: false })
    // }
    if (!DB.objectStoreNames.contains(filesTable)) {
        // create a table (object store) in athe database and add columns(object indices)
        let filesTb = DB.createObjectStore(filesTable, { autoIncrement: true });
        filesTb.createIndex('type', 'type', { unique: false })
    }
}


// if it is successful the reulting databse should be assigned to db
IDBrequest.addEventListener('success', e => {
    const { target: { result } } = e;

    DB = result;
    seedDB(DB)
        .then(() => {
            loadedDB = true;
            
            dispatchEvent(new Event(dbEvent));
            console.log("Indexeddb is ready to go!");
        })

});


export const deleteDatatbase = () => {
    const vert = confirm("Are you sure you wanna?");
    if (!vert) return 

    IDBPpromise( window.indexedDB.deleteDatabase(dbName) )
    .then(() => alert("Deleted Successfully!"))
    .catch(() => alert("Failed to delete DB!"))
}


export const loadDB = () => {
    
    return new Promise( resolve => {
        if (loadedDB) resolve(DB);
            
        else once( dbEvent, () => resolve(DB) )

    }).then(res => res);
}




export const getMsg = async (id) => {

    return await loadDB()
        .then(() => IDBPromise(openTrans(DB, msgsTable).get(id)))
        .then(msg => {
            // if it is continue else remove
            if (msg && msg.status === 'x') {
                return null
            }
            return msg
        })
        .catch(err => {
            console.error(err);
            return null
        })
}


export const getContactDetails = async (id) => {
    openTrans(DB, chatsTable).get(id)
    
    return loadDB()
        .then(() => IDBPromise( openTrans(DB, contactsTable).get(id)) )
        .then(res => res)
        .catch(err => {
            console.error(err);
            return null
        })
}