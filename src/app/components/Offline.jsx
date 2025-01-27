import { useContext, useEffect, useState } from "react";
import { useOnlineStatus } from "./Hooks";

import { IDBPromise, openTrans, msgsTable, offlineMsgsTable, loadDB } from "../../db";

import api from '../../data/api.json';
import { SendMsgContext } from "../contexts";
import { encryptMessage, encryptSymmetricKey, importServerPublicKey } from "../crypt.js";
import axiosInstance from "../../auth/axiosInstance.js";
import { apiHost } from "../../App.jsx";


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
                msg = {...msg, time: new Date().getTime()}
                updateMsgStatus(msg.id, 'sending')
            }

            msgs.reduce((promise, msg) => {
                let officialId;

                return promise
                .then( () => {
                    officialId = useSendMessageToServer(msg);
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

const useSendMessageToServer = (data) => {
    const sendUrl = apiHost + "/chats/send";
    const {updateMsgStatus} = useContext( SendMsgContext );

    const fd = new FormData();
    const {receivers, reply, textContent, file} = {data};
    
    // encrypt data
    encryptMessage({reply, textContent}, file)

    .then (async ({encryptedData, iv, encryptedFileData, key}) => {
        
        //  upload file(s)
        new Promise(res => {
            if (!file){
                res(null);
                return
            }

            const metadata = {
                type: file.type,
                size: file.size
            };

            const jsonData = {data: encryptedFileData, metadata, receivers};
            const mediaUploadUrl = apiHost + "/chats/media";
            
            // send all to server / each
            axiosInstance.post(mediaUploadUrl, jsonData, {
                headers: {
                  'Content-Type': 'application/json', // Ensure the server recognizes JSON data
                },
                withCredentials: true,
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    updateMsgStatus(data.id, progress)
                }
            }).then(res)
        })

        .then( async(fileId) => {

            // get public keys
            const publicKeys = await getPubicKeys(receivers)

            // for each receiver
            for (i = 0; i < receivers.length; i++) {
                if (!publicKeys[i]) return

                const {uuid, publicKey} = publicKeys[i];

                // encrypt the key to encrypted data
                const encryptedKey = await encryptSymmetricKey( key, await importServerPublicKey(publicKey) )

                const jsonData = {
                    uuid, iv,
                    key: encryptedKey,
                    file: fileId,
                    data: encryptedData
                }

                // send all to server / each
                return axiosInstance.post(sendUrl, jsonData, {
                    headers: {
                    'Content-Type': 'application/json', // Ensure the server recognizes JSON data
                    },
                    withCredentials: true,
                    onUploadProgress: (progressEvent) => {
                        const progress = Math.round((progressEvent.loaded * (i+1) * 100) / (progressEvent.total * receivers.length) ) ;
                        updateMsgStatus(data.id, progress)
                    }
                });
            }
        })
    })
}


async function getPubicKeys(list){
    const keysUrl = apiHost + "chats/api/public-keys";

    return axiosInstance.post(keysUrl, list)
    .then(res => res.data)
}


const saveMsgInDb = (id, msgData) => {

    return loadDB()
        .then( DB => IDBPromise (
                openTrans(DB, msgsTable, 'readwrite')
                .put( {...msgData, id:id} )
            )
        )
}
