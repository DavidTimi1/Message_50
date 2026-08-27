import { useContext, useEffect, useState } from "react";
import { useOnlineStatus } from "./Hooks";
import { useQueryClient } from "@tanstack/react-query";

import { IDBPromise, openTrans, msgsTable, offlineMsgsTable, loadDB } from "../../db";

import { SendMsgContext } from "../contexts";
import { encryptMessage, encryptSymmetricKey, importServerPublicKey } from "../crypt.js";
import axiosInstance from "../../auth/axiosInstance.js";
import { useSocket } from "../contexts/SocketContext.jsx";
import { UserContext } from "../../contexts.jsx";
import { API_ROUTES } from "../../lib/routes.js";


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
    const queryClient = useQueryClient();
    
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
            .then( () => setRunning(false) )
        }
    }


    async function processMessages(){

        return getMessagesFromStore()
        .then(msgs => {
            msgs = msgs.map( msg => {
                updateMsgStatus(msg.id, 'sending')
                return {...msg, time: new Date().getTime()}
            })

            return msgs.reduce((promise, msg) => {
                const offId = msg.id;
                const msgId = crypto.randomUUID();
                const newMsg = {...msg, id: msgId};

                return promise
                .then( () => {
                    return messageSender.send(newMsg);
                }) // send the message
                .then( () => migrateOfflineMessageToPermanent(newMsg, offId, queryClient) ) // atomic save/delete + cache updates
                .then( () => updateMsgStatus(offId, true, {newID: msgId}) ) // set status to sent
                .catch(err => {
                    console.error("Offline send failed:", err);
                    updateMsgStatus(offId, 'error');
                    if (msg && msg.receivers) {
                        queryClient.invalidateQueries({ queryKey: ["public-keys", [...msg.receivers].sort()] });
                    }
                })

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
    const userInfo = useContext(UserContext);
    const username = userInfo?.username;
    const { sendMsg } = useSocket();
    const queryClient = useQueryClient();

    return {send: run}

    function run(data){
        const {receivers, reply, textContent, time, file, rawFile, id} = data;

        // encrypt data
        return encryptMessage({reply, textContent, time, handle: username}, rawFile)
    
        .then (async ({encryptedData, iv, encryptedFileData, key}) => {
            
            //  upload file(s)
            return new Promise( async (res, rej) => {
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
                
                updateMsgStatus(`upload_${data.id}`, 0, undefined, 'upload')
                
                // send all to server / each
                await axiosInstance.post( API_ROUTES.MEDIA_UPLOAD , fd, {
                    withCredentials: true,
                    onUploadProgress: (progressEvent) => {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        updateMsgStatus(`upload_${data.id}`, progress / 100, undefined, "upload");
                    }

                }).then(response => {
                    updateMsgStatus(`upload_${data.id}`, true, undefined, "upload");

                    res( {...response.data, metadata: file.metadata} );
                }).catch(err => {
                    updateMsgStatus(`upload_${data.id}`, 'error', undefined, "upload");
                    rej(err);
                })
            })
    
            .then( async(fileObj) => {
                // get public keys
                const publicKeys = await getPubicKeys(receivers.filter( rec => rec !== username ), queryClient);
                const recipientUuids = Object.keys(publicKeys);
                
                if (recipientUuids.length === 0) return data.id;

                if (recipientUuids.length === 1) {
                    // Single recipient
                    const uuid = recipientUuids[0];
                    const publicKey = publicKeys[uuid];
                    const encryptedKey = await encryptSymmetricKey( key, await importServerPublicKey(publicKey) );

                    const jsonData = {
                        id,
                        receiverID: uuid,
                        data: {
                            iv, encryptedData,
                            key: encryptedKey,
                            file: fileObj,
                        }
                    };

                    sendMsg("new-message", jsonData);
                    return data.id;
                } else {
                    // Multi-recipient broadcast
                    const keys = {};
                    for (const uuid of recipientUuids) {
                        const publicKey = publicKeys[uuid];
                        if (publicKey) {
                            keys[uuid] = await encryptSymmetricKey( key, await importServerPublicKey(publicKey) );
                        }
                    }

                    const jsonData = {
                        id,
                        data: {
                            iv, encryptedData,
                            file: fileObj,
                        },
                        keys
                    };

                    sendMsg("broadcast", jsonData);
                    return data.id;
                }
            })
        })
    }
    
}


async function getPubicKeys(list, queryClient){
    if (!list || list.length === 0) return {}
    
    const sortedList = [...list].sort();
    return queryClient.fetchQuery({
        queryKey: ["public-keys", sortedList],
        queryFn: () => axiosInstance.get(API_ROUTES.PUBLIC_KEYS(sortedList)).then(({data}) => data),
        staleTime: 1000 * 60 * 60, // 1 hour cache
    });
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

const moveMessageToPermanentDb = (msgData, offId) => {
    return loadDB().then(DB => {
        return new Promise((resolve, reject) => {
            const trans = DB.transaction([msgsTable, offlineMsgsTable], 'readwrite');
            
            trans.oncomplete = () => resolve();
            trans.onerror = (e) => reject(e.target.error);

            const msgsStore = trans.objectStore(msgsTable);
            const offlineStore = trans.objectStore(offlineMsgsTable);

            // 1. Put in permanent msgsTable for each receiver
            const receivers = msgData.receivers || [];
            receivers.forEach(receiver => {
                msgsStore.put({
                    ...msgData,
                    receivers: undefined,
                    handle: receiver,
                    sent: true,
                    status: "s",
                    rawFile: null
                });
            });

            // 2. Delete from offlineMsgsTable
            offlineStore.delete(offId);
        });
    });
}

const migrateOfflineMessageToPermanent = (newMsg, offId, queryClient) => {
    return moveMessageToPermanentDb(newMsg, offId)
        .then(() => {
            const permanentMsg = {
                ...newMsg,
                sent: true,
                status: "s",
                rawFile: null
            };

            // Synchronously update messages cache to avoid race conditions
            queryClient.setQueriesData({ queryKey: ["messages", permanentMsg.handle] }, (old) => {
                if (!old) return old;
                const newUnsent = old.unsent.filter(m => m.id !== offId);
                if (old.data.some(m => m.id === permanentMsg.id)) return old;
                return {
                    data: [...old.data, permanentMsg],
                    unsent: newUnsent
                };
            });

            // Synchronously update chats list cache to avoid race conditions
            queryClient.setQueryData(["chats"], (old) => {
                if (!old) return old;
                const newUnsent = old.unsent.filter(m => m.id !== offId);
                const newData = [...old.data];
                const index = newData.findIndex(c => c.handle === permanentMsg.handle);
                if (index > -1) {
                    newData.splice(index, 1, permanentMsg);
                } else {
                    newData.push(permanentMsg);
                }
                return {
                    unsent: newUnsent,
                    data: newData
                };
            });
        });
}
