// USING INDEXED DATABASE
// global table database
export let DB;

export let loadedDB = false;

// open a new indexeddb 
const IDBrequest = indexedDB.open('messages_db', 1);


export const openTrans = (db, tb, mode) => db.transaction(tb, mode).objectStore(tb);


export const IDBPromise = req =>
    new Promise((res, rej) => {
        req.onsuccess = _ => res(req.result);
        req.onerror = _ => rej(req.error);
    })


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

    if (!DB.objectStoreNames.contains("all_messages_tb")) {
        // create a table (object store) in athe database and add columns(object indices)
        let messagesTable = DB.createObjectStore('all_messages_tb', { keyPath: 'id' });
        messagesTable.createIndex('timestamp', 'timestamp', { unique: false });
        messagesTable.createIndex('handle', 'handle', { unique: false });
    }
    if (!DB.objectStoreNames.contains("people_chats_tb")) {
        // create a table (object store) in athe database and add columns(object indices)
        let peopleChatsTable = DB.createObjectStore("people_chats_tb", { keyPath: 'handle' });
        // peopleChatsTable.createIndex('unread', 'unread', {unique: false});
    }
    // if (!DB.objectStoreNames.contains("people_tb")) {
    //     // create a table (object store) in athe database and add columns(object indices)
    //     let peopleTable = DB.createObjectStore('people_tb', { keyPath: 'id' });
    //     peopleTable.createIndex('handle', 'handle', { unique: false });
    // }
    if (!DB.objectStoreNames.contains("offline_messages")) {
        // create a table (object store) in athe database and add columns(object indices)
        let offlineMessages = DB.createObjectStore('offline_messages', { autoIncrement: true });
        offlineMessages.createIndex('handle', 'handle', { unique: false });
    }
    if (!DB.objectStoreNames.contains("offline_tasks")) {
        // create a table (object store) in athe database and add columns(object indices)
        let undone = DB.createObjectStore('offline_tasks', { autoIncrement: true });
        undone.createIndex('taskType', 'taskType', { unique: false })
    }
    if (!DB.objectStoreNames.contains("files")) {
        // create a table (object store) in athe database and add columns(object indices)
        let filesTable = DB.createObjectStore('files', { autoIncrement: true });
        filesTable.createIndex('type', 'type', { unique: false })
    }
}


// if it is successful the reulting databse should be assigned to db
IDBrequest.addEventListener('success', e => {
    DB = e.target.result;
    loadedDB = true;

    dispatchEvent(new Event('loadedDatabase'));
    console.log("Indexeddb is ready to go!");
});