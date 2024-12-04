
import { openTrans, IDBPromise, msgsTable, contactsTable, chatsTable, offlineMsgsTable, loadDB } from "../db";

import msgsData from './messages.json';
import contactsData from './contacts.json';
import offlineData from './offline.json';
import chatsData from './chats.json';


function loadMsgs(DB) {

    const dataList = msgsData;
    const transaction = openTrans(DB, msgsTable, 'readwrite');

    return dataList.reduce((promise, data) => {

        return promise
            .then(() => IDBPromise(transaction.put(data)))

    }, new Promise(res => res()));


}


function loadContacts(DB) {

    const dataList = contactsData;
    const transaction = openTrans(DB, contactsTable, 'readwrite');

    return dataList.reduce((promise, data) => {

        return promise
            .then(() => IDBPromise(transaction.put(data)))

    }, new Promise(res => res()));
}


function loadChats(DB) {

    const dataList = chatsData;
    const transaction = openTrans(DB, chatsTable, 'readwrite');

    return dataList.reduce((promise, data) => {

        return promise
            .then(() => IDBPromise(transaction.put(data)))

    }, new Promise(res => res()));
}


async function loadOffline(DB) {

    const dataList = offlineData;
    const transaction = openTrans(DB, offlineMsgsTable, 'readwrite');

    const count = await IDBPromise(transaction.count());

    if (count) return

    return dataList.reduce((promise, data) => {

        return promise
            .then(() => IDBPromise(transaction.put(data)))

    }, new Promise(res => res()));
}


export function seedDB(DB) {
    return loadChats(DB)
        .then(() => loadContacts(DB))
        .then(() => loadMsgs(DB))
        .then(() => loadOffline(DB))
}