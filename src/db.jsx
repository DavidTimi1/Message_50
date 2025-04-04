// USING INDEXED DATABASE

import { DevMode } from "./App";
import { ALLOWED_MEDIA_TYPES } from "./app/media/page";
import { seedDB } from "./data/loadData";
import { once, runOnComplete } from "./utils";

// global table database
let DB;

export let loadedDB = false;
export let DBrestart = false;
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
export const keysTable = 'keys';


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
    DBrestart = true;
    
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
        messagesTable.createIndex('handle_time', ['handle', 'time'], { unique: false });
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
        let offlineMessages = DB.createObjectStore(offlineMsgsTable, { autoIncrement: true, keyPath: 'id' });
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
    
    // For storing secrets
    if (!DB.objectStoreNames.contains(keysTable)) {
        DB.createObjectStore(keysTable, { keyPath: "id" });
    }
}


// if it is successful the reulting databse should be assigned to db
IDBrequest.addEventListener('success', e => {
    const { target: { result } } = e;

    DB = result;
    if (DevMode){
        seedDB(DB)
        .then(() => {
            loadedDB = true;
            
            dispatchEvent(new Event(dbEvent));
            console.log("Indexeddb is ready to go!");
        })

    } else {
        loadedDB = true;
        
        dispatchEvent(new Event(dbEvent));
        console.log("Indexeddb is ready to go!");
    }

});


export const deleteDatabase = () => {
    const vert = confirm("Are you sure you wanna?");
    if (!vert) return 

    let done = false;

    loadDB()
    .then( DB => {
        DB.close() // close open transactions
        carryOutDeletion();
    })

    setTimeout(carryOutDeletion, 3000);

    function carryOutDeletion(){
        if (done) return 
        done = true;

        return IDBPromise( indexedDB.deleteDatabase(dbName) )
        .then(() => {
            alert("Deleted DB Successfully!")
        })
        .catch(() => alert("Failed to delete DB!"))
    }
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


export const getContactDetailsFromDB = async (handle) => {
    
    return loadDB()
        .then(DB => IDBPromise( openTrans(DB, contactsTable).get(handle)) )
        .then(res => res)
        .catch(err => {
            console.error(err);
            return null
        })
}

export const saveContactToDB = async(user) => {
    // saves a user's details and returns true if successful else false

    return loadDB()
        .then(DB => IDBPromise( openTrans(DB, contactsTable, "readwrite").put(user)) )
        .then(_ => true)
        .catch(err => {
            console.error(err);
            return false
        })
}

export const saveFile = async (file) => {
    let type = file.type.split("/")[0];
    type = ALLOWED_MEDIA_TYPES.includes(type) ? type : "other"
    
    return loadDB()
        .then( DB => IDBPromise( openTrans(DB, filesTable, 'readwrite').add({ type, data: file }) ) )
        .then(res => res)
        .catch(err => {
            console.error(err);
            return null
        })
}


export const getFile = async (fileID) => {
    
    return loadDB()
        .then( DB => IDBPromise( openTrans(DB, filesTable).get(fileID) ) )
        .then(res => res)
        .catch(err => {
            console.error(err);
            return null
        })
}


export const hasMessaged = (handle) => {
    // range should start from the first
    const range = IDBKeyRange.lowerBound([handle, 0]);

    return loadDB()
    .then( DB => 
        IDBPromise( openTrans(DB, msgsTable).index("handle_time").count(range) )
    )
}


export const updateMessage = (id, property, args) => {

    return loadDB()
        .then(DB => {
            const objectStore = openTrans(DB, msgsTable, 'readwrite')

            return IDBPromise(objectStore.get(id))
            .then(msg => {
                // if it is continue else remove
                if (msg && msg.status === 'x') {
                    return null
                }
                if (property === 'file' && msg.file){
                    msg.file.fileId = args.fileId;

                    return IDBPromise(objectStore.put(msg));
                }
            })
            .then(_ => ({success: true}))
            .catch(err => {
                console.error(err);
                return null
            })
        })

}