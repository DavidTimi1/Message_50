import React, { useEffect, useState, useContext } from "react";

import { ChatContext, SendMsgContext } from '../contexts';

import { MsgListContext } from './contexts';
import { loadMoreMessages } from './components/Messaging';
import { getMsg, getContactDetailsFromDB, updateMessage } from "../../db";
import { LoadingMessageList } from "./components/MsgListLoader";
import { useMessages } from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "../contexts/SocketContext";
import axiosInstance from "../../auth/axiosInstance";
import { API_ROUTES } from "../../lib/routes";

export const MsgListProvider = ({ children }) => {
    const [reply, setReply] = useState();
    const queryClient = useQueryClient();
    const { sendMsg } = useSocket();

    const chatContext = useContext(ChatContext), chatting = chatContext.cur, viewMsg = chatContext.id;
    const { data: messagesData, isLoading } = useMessages(chatting, viewMsg);

    const msgList = messagesData?.data || [];
    const pendingList = messagesData?.unsent || [];
    const firstId = msgList[0]?.id;

    const { msgsStatus } = useContext(SendMsgContext);



    useEffect(() => {
        if (isLoading || !messagesData || !chatting) return;

        const unreadMsgs = msgList.filter(msg => !msg.sent && msg.status !== 'r');
        if (unreadMsgs.length === 0) return;

        getContactDetailsFromDB(chatting).then(async (contact) => {
            let senderUuid = contact?.id;
            if (!senderUuid) {
                const keys = await axiosInstance.get(API_ROUTES.PUBLIC_KEYS([chatting])).then(r => r.data).catch(() => ({}));
                senderUuid = Object.keys(keys)[0];
            }
            if (!senderUuid) return;

            unreadMsgs.forEach(msg => {
                sendMsg("status-ack", {
                    receiverID: senderUuid,
                    id: msg.id,
                    status: "r"
                });
                updateMessage(msg.id, 'status', 'r');
            });

            // Update cache locally
            queryClient.setQueryData(["messages", chatting, viewMsg], (old) => {
                if (!old) return old;
                return {
                    ...old,
                    data: old.data.map(msg => (!msg.sent && msg.status !== 'r') ? { ...msg, status: 'r' } : msg)
                };
            });

            // Also update the chats list cache unread indicator
            queryClient.setQueryData(["chats"], (old) => {
                if (!old) return old;
                return {
                    ...old,
                    data: old.data.map(c => (c.handle === chatting && !c.sent && c.status !== 'r') ? { ...c, status: 'r' } : c)
                };
            });
        });
    }, [messagesData, isLoading, chatting, sendMsg, queryClient, viewMsg, msgList]);

    return (
        <MsgListContext.Provider value={{
            cur: msgList,
            pending: pendingList,
            addNotSent,
            loadPreviousMsgs,
            replyTo,
            reply,
        }}>
            {
                isLoading ? (
                    <LoadingMessageList />
                ) : (
                    children
                )

            }
        </MsgListContext.Provider>
    )


    function replyTo(id) {
        setReply(id)
    }

    function loadPreviousMsgs() {
        loadMoreMessages(null, firstId)
            .then(msgs => {
                queryClient.setQueryData(["messages", chatting, viewMsg], (old) => {
                    if (!old) return old;
                    return {
                        ...old,
                        data: [...msgs, ...old.data]
                    };
                });
            })
    }

    function addNotSent(data) {
        queryClient.setQueryData(["messages", chatting, viewMsg], (old) => {
            if (!old) return old;
            return {
                ...old,
                unsent: [...old.unsent, data]
            };
        });

        // Bubble to top of chats list
        queryClient.setQueryData(["chats"], (old) => {
            if (!old) return old;
            const newUnsent = [...old.unsent];
            const index = newUnsent.findIndex(c => c.handle === chatting);
            if (index > -1) {
                newUnsent.splice(index, 1);
            }
            newUnsent.unshift(data); // Add as first unsent
            return {
                ...old,
                unsent: newUnsent
            };
        });
    }

}