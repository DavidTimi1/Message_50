import React, { useEffect, useState, useContext } from "react";

import { ChatContext, SendMsgContext } from '../contexts';

import { MsgListContext } from './contexts';
import { getMessages, loadMoreMessages } from './components/Messaging';



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

        if (chatting) {

            getMessages(chatting, viewMsg)
            .then(res => {
                setMsgList(res.data)
                setPendingList(res.unsent)
            })
        }

        return () => {
            t_id && clearTimeout(t_id);
            ignore = true;
        }

    }, [chatting]);


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