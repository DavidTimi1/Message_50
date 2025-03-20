import React, { useEffect, useState, useContext } from "react";

import { ChatContext, SendMsgContext } from '../contexts';

import { MsgListContext } from './contexts';
import { getMessages, loadMoreMessages } from './components/Messaging';
import { getMsg } from "../../db";
import { newMsgEvent } from "../components/Sockets";
import { on } from "../../utils";



export const MsgListProvider = ({children}) => {
    const [reply, setReply] = useState();
    const [preview, setPrev] = useState({});

    const [msgList, setMsgList] = useState([]);
    const [pendingList, setPendingList] = useState([]);

    const firstId = msgList[0]?.id, lastId = msgList?.[msgList.length - 1]?.id;

    const chatContext = useContext(ChatContext), chatting = chatContext.cur, viewMsg = chatContext.id;

    const { msgsStatus } = useContext(SendMsgContext);


    useEffect(() => {
        let t_id, ignore = false;
        const handleEvent = e => {
            const data = e.detail;
            if (data.handle !== chatting) return

            setMsgList( prev => [...prev, data])
        };

        if (chatting) {
    
            on(newMsgEvent, handleEvent)

            getMessages(chatting, viewMsg)
            .then(res => {
                setMsgList(res.data)
                setPendingList(res.unsent)
            })
        }

        return () => {
            t_id && clearTimeout(t_id);
            ignore = true;
            removeEventListener(newMsgEvent, handleEvent)
        }

    }, [chatting]);

    
    useEffect(() => {
        if (!chatting) return

        // to effect status changes
        for (let status of msgsStatus) {
            const index = pendingList.findIndex(val => val.id === status.id);

            if (index > -1 && status.status === true) {

                // get message and add to list to be displayed
                const newMsgID = status.args?.newID;
                if (newMsgID){
                    getMsg(newMsgID)
                    .then( msg => {
                        if (msg){
                            setMsgList( prev => [...prev, msg] )
                                
                            setPendingList(prev => {
                                const clone = [...prev];
                                clone.splice(index, 1);
                                return clone
                            })
                        }
                    })
                }
                
            }
        }

    }, [chatting, msgsStatus]);
    


    return (
        <MsgListContext.Provider value={{
            cur: msgList, 
            pending: pendingList,
            addNotSent,
            loadPreviousMsgs,
            replyTo,
            reply,
        }}>
            { children }
        </MsgListContext.Provider>
    )

    
    function replyTo(id) {
        setReply(id)
    }
    
    function loadPreviousMsgs() {
        loadMoreMessages(null, firstId)
            .then(msgs => {
                setMsgList(prev => [...msgs, ...prev])
            })
    }

    function addNotSent(data) {
        setPendingList(prev => [...prev, data]);
    }


}