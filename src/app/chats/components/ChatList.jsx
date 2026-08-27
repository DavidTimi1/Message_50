import './ChatList.css';

import { useContext, useEffect, useRef, useState } from 'react'

import { ChatContext, SendMsgContext, ToggleOverlay } from '../../contexts';
import { DevMode } from '../../../App';
import { on, timePast } from '../../../utils';
import { chatsTable, offlineMsgsTable, openTrans, loadDB, getMsg, msgsTable } from '../../../db';
import { useContactName } from '../../components/Hooks';
import StatusIcon from '../../components/status';
import { newMsgEvent } from '../../components/Sockets';
import { UserProfilePic } from '../../contacts/components/ContactItem';
import { TextualFile } from '../../media/page';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import LoadingChatList from './chatListLoader';


import { useChats } from '../../../api';
import { useQueryClient } from '@tanstack/react-query';

export const ChatList = () => {
    const ref = useRef(null);
    const queryClient = useQueryClient();

    const { data: chatsData, isLoading } = useChats();
    const chats = chatsData?.data || [];
    const pendingList = chatsData?.unsent || [];

    const compound = [...pendingList, ...chats].sort((prev, next) => prev.time - next.time);
    compound.reverse();

    const toggleMessaging = useContext(ChatContext).set;
    const { msgsStatus } = useContext(SendMsgContext);




    return (
        <div className="chat-list custom-scroll max" ref={ref}>
            <ol className='content max'>
                {
                    isLoading ? (
                        <LoadingChatList />
                        
                    ) : compound.length ?

                        compound.map(chat => {
                            const { handle, receivers } = chat;

                            return (
                                <ChatItem
                                    key={handle === 'multiple' ? String(receivers) : handle}
                                    Message={toggleMessaging}
                                    data={chat}
                                />
                            )
                        })
                    :
                    <>
                        <li className="no-message"> You do not have any chats. </li>
                        <li className="new-ptr">
                            Click the message icon to create a new chat.
                        </li>
                    </>

                }
            </ol>
        </div>
    )
}


const ChatItem = ({ data, Message }) => {
    const { id, time, handle, textContent, sent, file, status, notSent } = data;
    const name = useContactName(handle);

    const toggleOverlay = useContext(ToggleOverlay);


    return (
        <li className='chat-cont br-1' data-id={id}>
            <div className='abs-mid br-1 max'>
                <div className='fw flex mid-align' style={{ justifyContent: "space-between", padding: "10px 5px" }}>

                </div>
            </div>
            <div className='max mid-align flex gap-2 br-1' style={{ padding: "10px 5px" }} onClick={handleClick}>

                <div className='flex' onClick={showUserDetails}>
                    <UserProfilePic handle={handle} />
                </div>

                <div className="flex-col details grow gap-1">
                    <div className="flex fw" style={{ justifyContent: "space-between", alignItems: "baseline" }}>
                        <div className="user grow crop-excess" title={name}>
                            {handle !== "multiple" ? name : "Broadcast List"}
                        </div>
                        <small className='tl'>
                            <TimePast time={time} pending={notSent} />
                        </small>
                    </div>
                    <div className='grow crop-excess'>
                        <div className="flex chat-msg gap-1 mid-align">
                            {
                                sent ?
                                <StatusIcon statusChar={status} />
                                : (!sent && status !== 'r') ?
                                <span className="unread-badge"></span>
                                : null
                            }
                            {
                                file && <TextualFile fileInfo={file} hasText={Boolean(textContent)} />
                            }
                            <span> {textContent.slice(0,50)}{textContent.length > 50? '...' : ''} </span>
                        </div>
                        </div>
                </div>
            </div>
        </li>
    )


    function handleClick(e) {
        e.stopPropagation();

        Message(handle)
    }

    function showUserDetails(e) {
        e.stopPropagation();

        const args = {
            id: handle, 
            list: handle === "multiple"? data.receivers : false
        }

        toggleOverlay('user-card', args);
    }
}

export function TimePast({ time, pending }) {
    const [value, setValue] = useState(timePast(time));

    useEffect(() => {
        if (value === 'Just now'){
            setValue(timePast(time), 120000) // after 2 mins
        }

    })

    return (
        pending?
        <FontAwesomeIcon icon={faClock} size="sm" style={{margin: ".25rem"}} />
        :
        value
    )

}


function getChats(max) {
    let list = [], unsent = [], done = [];
    let i = 0;

    // make sure db is loaded first
    return loadDB()
        .then(DB => new Promise(res => {

            // check for any chat that has unsent messages starting getting only the last per user
            openTrans(DB, offlineMsgsTable)
            .openCursor(null, "prev")
            .onsuccess = e => {
                let cursor = e.target.result;

                if (cursor) {
                    const { value } = cursor, { handle } = value;

                    if (!done.includes(handle)){
                        unsent.push({...value, notSent: true});
                        done.push(handle);
                    }

                    cursor.continue();

                } else {
                    // check the messages sent to each person starting from the person last chatted with

                    openTrans(DB, msgsTable)
                    .index('handle_time')
                    .openCursor(null, 'prev')
                    .onsuccess = e => {
                        let cursor = e.target.result;

                        if (cursor && i < max) {
                            const { value } = cursor, { handle } = value;

                            // if the chat has unsent messages, skip
                            if (!done.includes(handle)) {
                                list.push(value);
                                done.push(handle);
                                i++;
                            }

                            cursor.continue();

                        } else
                            res({
                                unsent: unsent,
                                data: list
                            })
                    }
                      
                }
            }
        }))
}