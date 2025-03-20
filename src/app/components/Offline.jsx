import { useContext, useEffect, useState } from "react";
import { useOnlineStatus } from "./Hooks";

import { IDBPromise, openTrans, msgsTable, offlineMsgsTable, loadDB } from "../../db";

import api from '../../data/api.json';
import { SendMsgContext } from "../contexts";
import { encryptMessage, encryptSymmetricKey, importServerPublicKey } from "../crypt.js";
import axiosInstance from "../../auth/axiosInstance.js";
import { apiHost } from "../../App.jsx";
import { socketSend } from "./Sockets.js";
import { UserContext } from "../../contexts.jsx";


export const SendMsgsProvider = ({children}) => {
    // to hold all status of unsent messages
    const [msgsStatus, setMsgsStatus] = useState([]);

    return (
        <SendMsgContext.Provider value={{msgsStatus, updateMsgStatus}}>
            <OnOnlineMsgSender />
            { children }
        </SendMsgContext.Provider>
    )


    function updateMsgStatus(msgId, status, args){
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

        setMsgsStatus( prev => {
            const clone = [...prev];
            const index = clone.findIndex(msg => msg.id === msgId);
            const newStatus = {id: msgId, status, args}
            
            if (index >= 0){
                clone.splice(index, 1, newStatus);

            } else {
                clone.push({id: msgId, status, args})
            }
            return clone
        })
    }

}


let singleInstance = null;

export const useOfflineActivities = () => {
    const [running, setRunning] = useState(null);
    const [rerun, setReRun] = useState(null);
    const {updateMsgStatus} = useContext( SendMsgContext );
    const messageSender = useMessageSender();
    
    if (!singleInstance) {
        singleInstance = {
            sendMsg: handleCall
        };
    }

    useEffect(() => {
        if (rerun && !running){
            handleCall();
            setReRun(false);

        }

    }, [rerun, running]);
    
    useEffect(() => {
        return () => {
            singleInstance = null; // Reset on unmount if needed
        };
    }, []);


    return ( singleInstance )

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


    async function processMessages(){

        return getMessagesFromStore()
        .then(msgs => {
            msgs = msgs.map( msg => {
                updateMsgStatus(msg.id, 'sending')
                return {...msg, time: new Date().getTime()}
            })

            msgs.reduce((promise, msg) => {
                const offId = msg.id;
                const msgId = crypto.randomUUID();
                const newMsg = {...msg, id: msgId};

                return promise
                .then( () => {
                    messageSender.send(newMsg);
                }) // send the message
                .then( () => deleteMessageFromStore(offId) ) // delete after success
                .then( () => saveMsgInDb(newMsg) ) // save message in db
                .then( () => updateMsgStatus(offId, true, {newID: msgId}) ) // set status to sent
                .catch(_ => console.log("Back to DB"))

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


const useMessageSender = () => {
    const {updateMsgStatus} = useContext( SendMsgContext );
    const {username} = useContext(UserContext);


    return {send: run}

    function run(data){
        const {receivers, reply, textContent, time, file, id} = data;

        // encrypt data
        encryptMessage({reply, textContent, time, handle: username}, file)
    
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
                }).then(response => res( response.data ))
            })
    
            .then( async(fileId) => {
                // get public keys
                const publicKeys = await getPubicKeys(receivers)
    
                // for each receiver
                for (let uuid in publicKeys) {
                    let publicKey = publicKeys[uuid]
                    if (!publicKey) return
    
                    // encrypt the key to encrypted data
                    const encryptedKey = await encryptSymmetricKey( key, await importServerPublicKey(publicKey) )
    
                    const jsonData = {
                        id,
                        receiverID: uuid,
                        data: {
                            iv, encryptedData,
                            key: encryptedKey,
                            file: fileId,
                        }
                    }
    
                    // send all to server / each using websocket
                    socketSend("new-message", jsonData)
                    return data.id
                }
            })
        })
    }
    
}


async function getPubicKeys(list){
    if (!list) return {}
    
    const keysUrl = apiHost + "/chat/api/user/public-key/?username=";
    const query = list.join("&username=");

    return axiosInstance.get(keysUrl + query)
    .then(({data}) => data)
}


const saveMsgInDb = (msgData) => {

    return loadDB()
        .then( DB => (
            Promise.all( msgData.receivers.map( receiver => (
                IDBPromise (
                    openTrans(DB, msgsTable, 'readwrite')
                    .put( {
                        ...msgData,
                        receivers: undefined,
                        handle: receiver,
                        sent: true,
                        status: "s"
                    } )
                )
            )))
        ))
}
