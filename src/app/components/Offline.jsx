import { useContext, useEffect, useState } from "react";
import { useOnlineStatus } from "./Hooks";

import { IDBPromise, openTrans, msgsTable, offlineMsgsTable, loadDB } from "../../db";

import { SendMsgContext } from "../contexts";
import { encryptMessage, encryptSymmetricKey, importServerPublicKey } from "../crypt.js";
import axiosInstance from "../../auth/axiosInstance.js";
import { socketSend } from "./Sockets.js";
import { UserContext } from "../../contexts.jsx";


export const SendMsgsProvider = ({children}) => {
    // to hold all status of unsent messages
    const [msgsStatus, setMsgsStatus] = useState([]);
    const [loadStatus, setloadStatus] = useState([]);

    return (
        <SendMsgContext.Provider value={{msgsStatus, loadStatus, updateMsgStatus}}>
            <OnOnlineMsgSender />
            { children }
        </SendMsgContext.Provider>
    )


    function updateMsgStatus(msgId, status, args, type="msg"){
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
        const updatedFromPrevious = prev => {
            const clone = [...prev];
            const index = clone.findIndex(msg => msg.id === msgId);
            const newStatus = {id: msgId, status, args}
            
            if (index >= 0){
                clone.splice(index, 1, newStatus);

            } else {
                clone.push({id: msgId, status, args})
            }
            return clone
        }

        if (type !== 'msg'){
            setloadStatus( updatedFromPrevious )
            return
        }

        setMsgsStatus(  updatedFromPrevious )
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
                .catch(err => console.log("Back to DB", err))

            }, new Promise(res => res())) // start the chain of promises
        })
    }
}


export const OnOnlineMsgSender= () =>{
    
    const offlineActs = useOfflineActivities();
    const isOnline = useOnlineStatus();
    
    useEffect(() => {
        if (isOnline){
            offlineActs.sendMsg();
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
        const {receivers, reply, textContent, time, file, rawFile, id} = data;

        // encrypt data
        encryptMessage({reply, textContent, time, handle: username}, rawFile)
    
        .then (async ({encryptedData, iv, encryptedFileData, key}) => {
            
            //  upload file(s)
            new Promise( async res => {
                // if only sending to self no need to upload
                if (!rawFile || (receivers.length === 1 && receivers[0] === username)){
                    res(null);
                    return
                }

                const fd = new FormData();

                const blob = new Blob([encryptedFileData.data], { type: "application/octet-stream" });
                const filedBlob = new File([blob], "file", { type: "application/octet-stream" });
    
                const metadata = {
                    ...file.metadata,
                    recipients: receivers,
                    iv: encryptedFileData.iv
                };
                
                fd.append("file", filedBlob)
                fd.append("metadata", JSON.stringify(metadata))
    
                const mediaUploadUrl = "/media/upload/";
                
                updateMsgStatus(`upload_${data.id}`, 0, undefined, 'upload')
                
                // send all to server / each
                await axiosInstance.post( mediaUploadUrl, fd, {
                    withCredentials: true,
                    onUploadProgress: (progressEvent) => {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        updateMsgStatus(`upload_${data.id}`, progress / 100, undefined, "upload");
                    }

                }).then(response => {
                    updateMsgStatus(`upload_${data.id}`, true, undefined, "upload");

                    res( {...response.data, metadata: file.metadata} );
                })
            })
    
            .then( async(fileObj) => {
                // get public keys
                const publicKeys = await getPubicKeys(receivers.filter( rec => rec !== username ));
    
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
                            file: fileObj,
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
    
    const keysUrl = "/user/public-key/?username=";
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
                        status: "s",
                        rawFile: null
                    } )
                )
            )))
        ))
}
