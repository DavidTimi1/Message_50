import './ChatList.css';

import { useContext, useEffect, useRef, useState } from 'react'

import { ChatContext, SendMsgContext, ToggleOverlay } from '../../contexts';
import { DevMode } from '../../../App';
import { timePast } from '../../../utils';
import { chatsTable, offlineMsgsTable, openTrans, loadDB } from '../../../db';
import { useContactName } from '../../components/Hooks';


export const ChatList = () => {
    const ref = useRef(null);

    const [chats, setChats] = useState([]), initThreshold = 50;
    const [pendingList, setPendingList] = useState([]);

    const compound = [...pendingList, ...chats].sort((prev, next) => prev.time - next.time)

    const toggleMessaging = useContext(ChatContext).set;

    const firstId = chats[0]?.id, lastId = chats?.[chats.length - 1]?.id;

    const { msgsStatus } = useContext(SendMsgContext);


    useEffect(() => {
        // if (!DevMode){
        getChats(initThreshold)
            .then(res => {
                setChats(res.data);
                setPendingList(res.unsent);

            })
        // }

    }, []);


    useEffect(() => {
        // to effect status changes
        for (let status of msgsStatus) {
            const index = pendingList.findIndex(val => val.id === status.id);

            if (index > -1 && status.status?.success) {
                console.log("yup its me!!!");

                setPendingList(prev => {
                    const clone = [...prev];

                    clone.splice(index, 1);

                    return clone
                })

                // get message and add to list to be displayed
                getChats()
                    .then(res => {
                        setChats(res.data);
                        setPendingList(res.unsent);
                    })
            }
        }

    }, [msgsStatus]);


    return (
        <div className="chat-list custom-scroll max" ref={ref}>
            <div className='content max'>
                {compound.length ?

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
                        <div className="no-message"> You do not have any chats. </div>
                        <div className="new-ptr">
                            Click the message icon to create a new chat.
                        </div>
                    </>

                }
            </div>
        </div>
    )
}


const ChatItem = ({ data, Message }) => {
    const { id, time, handle, textContent, status } = data;
    const name = useContactName(handle);

    const toggleOverlay = useContext(ToggleOverlay);


    return (
        <div className='chat-cont br-1' data-id={id}>
            <div className='abs-mid br-1 max'>
                <div className='fw flex mid-align' style={{ justifyContent: "space-between", padding: "10px 5px" }}>

                </div>
            </div>
            <div className='max mid-align flex gap-3 br-1' style={{ padding: "10px 5px" }} onClick={handleClick}>
                <div className='dp-img flex' onClick={showUserDetails}>

                </div>
                <div className="flex-col details grow gap-1">
                    <div className="flex fw" style={{ justifyContent: "space-between", alignItems: "baseline" }}>
                        <div className="user grow crop-excess" title={name}>
                            {handle !== "multiple" ? name : "Broadcast List"}
                        </div>
                        <small className='tl'>
                            <TimePast time={time} />
                        </small>
                    </div>
                    <div className="flex chat-msg fw" style={{ alignItems: "baseline" }}>
                        {status}
                        <span> {textContent} </span>
                    </div>
                </div>
            </div>
        </div>
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

function TimePast({ time }) {
    const [value, setValue] = useState(timePast(time));

    setTimeout(() => setValue(timePast(time)), 60000);

    return (
        <>{value}</>
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

                        unsent.push(value);
                        done.push(handle);

                        i++;
                        cursor.continue();

                    } else {
                        // check the messages sent to each person starting from the person last chatted with

                        openTrans(DB, chatsTable)
                            .openCursor()
                            .onsuccess = e => {
                                let cursor = e.target.result;

                                if (cursor && i < max) {
                                    const { value } = cursor, { handle } = value;

                                    // if the chat has unsent messages, skip
                                    if (!done.includes(handle)) {
                                        list.push(value);
                                    }

                                    i++;
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