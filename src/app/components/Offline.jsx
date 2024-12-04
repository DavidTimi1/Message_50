import { useContext, useEffect, useState } from "react";
import { useOnlineStatus } from "./Hooks";

import { IDBPromise, openTrans, msgsTable, offlineMsgsTable, loadDB } from "../../db";

import api from '../../data/api.json';
import { SendMsgContext } from "../contexts";


export const SendMsgsProvider = ({children}) => {
    // to hold all status of unsent messages
    const [msgsStatus, setMsgsStatus] = useState([]);

    return (
        <SendMsgContext.Provider value={{msgsStatus, updateMsgStatus}}>
            <OnOnlineMsgSender />
            { children }
        </SendMsgContext.Provider>
    )


    function updateMsgStatus(msgId, status){

        // if completely sent remove from list
        // if (status === true){
        //     setMsgsStatus( prev => {
        //         const clone = prev.slice();
        //         const index = prev.findIndex(msg => msg.id === msgId);

        //         if (index > -1){
        //             clone.splice(index, 1);
        //             return clone;
        //         }
        //     })

        //     return 
        // }

        setMsgsStatus( prev => 
            prev.map( msg => msg.id === msgId? {...msg, status} : msg )
        )
    }

}


export const useOfflineActivities = () => {
    const [running, setRunning] = useState(null);
    const [rerun, setReRun] = useState(null);
    const {updateMsgStatus} = useContext( SendMsgContext );

    useEffect(() => {
        if (rerun && !running){
            handleCall();
            setReRun(false);

        }

    }, [rerun, running])


    return ({
        sendMsg: handleCall
    })

    // to avoid race conditions
    function handleCall(){
        if (running){
            setReRun(true);
        } else {
            setRunning(true);

            processMessages()
            .then( setRunning(false) )
        }
    }


    function processMessages(){

        getMessagesFromStore()
        .then(msgs => {
            for (let msg of msgs){
                updateMsgStatus(msg.id, 'sending')
            }

            msgs.reduce((promise, msg) => {
                let officialId;

                return promise
                .then( () => {
                    officialId = sendMessageToServer(msg);
                }) // send the message
                .then( () => deleteMessageFromStore(msg.id) ) // delete after success
                .then( () => saveMsgInDb(officialId, msg) ) // save message in db
                .then( () => updateMsgStatus(msg.id, {id: officialId, success: true}) ) // set status to sent

            }, new Promise(res => res())) // start the chain of promises
        })
    }
}


export const OnOnlineMsgSender= () =>{
    
    const offlineActs = useOfflineActivities();
    const isOnline = useContext(useOnlineStatus);
    
    useEffect(() => {
        if (isOnline){
            offlineActs.sendMsg()
        }

    }, [isOnline, offlineActs])
}



const getMessagesFromStore = () => {
    
    return loadDB()
        .then( DB => IDBPromise (
                openTrans(DB, offlineMsgsTable)
                .getAll()
            )
        )
}

const deleteMessageFromStore = (id) => {
    
    return loadDB()
        .then( DB => IDBPromise (
                openTrans(DB, offlineMsgsTable, 'readwrite')
                .delete(id)
            )
        )
}

const sendMessageToServer = (data) => {
    const fd = new FormData();

    // encrypt data
    const jsonData = JSON.stringify({...data, file: undefined})
    fd.append('jsonBody', jsonData);

    fd.append('file', data.file);



    return fetch(api.sendMessage, {
        method: post,
        body: fd
    })
}


const saveMsgInDb = (id, msgData) => {

    return loadDB()
        .then( DB => IDBPromise (
                openTrans(DB, msgsTable, 'readwrite')
                .put( {...msgData, id:id} )
            )
        )
}
