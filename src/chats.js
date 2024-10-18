import './ui/chats.css';

import { useContext, useState } from 'react'

import ProfilePic from './contacts'
import { ChatContext } from './contexts';
import { DevMode } from './App';
import { TimePast } from './more';


export default function ChatList(){
    const [chats, setChats] = useState(DevMode? devChats : []);
    const [filters, setFilters] = useState([]);
    const [search, setSearch] = useState(false);

    const toggleMessaging = useContext(ChatContext).set;


    return (
        <div className="chat-list custom-scroll max">
            <div className='content max'>
            { chats.length? 
                chats.map( chat =>{
                    const {handle, receivers} = chat;
                    return (
                        <ChatItem 
                            key={handle === 'multiple'? String(receivers) : handle}
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


export function ChatItem({data, Message}){
    const {id, time, name, handle, msg, status} = data;

    return (
        <div className='chat-cont br-5'>
            <div className='chat-bg abs-mid br-5' style={{backgroundColor: "red"}}>
                <div className='fw flex mid-align' style={{justifyContent: "space-between", padding: "10px 5px"}}>

                </div>
            </div>
            <div className='max mid-align flex gap-2 br-5' style={{backgroundColor: "var(--prim-col)", padding: "10px 5px"}} onClick={handleClick}>
                <div className='dp-img'>
                    <ProfilePic />
                </div>
                <div className="flex-col grow gap-1">
                    <div className="flex fw" style={{justifyContent: "space-between", alignItems: "baseline"}}>
                        <div className="user" title={name}> 
                            {handle !== "multiple" ? name : "Broadcast List"} 
                        </div>
                        <small style={{color: "grey"}}>
                            <TimePast time={time} />
                        </small>
                    </div>
                    <div className="flex chat-msg fw" style={{ alignItems: "baseline"}}>
                        {status}
                        <span> {msg} </span>
                    </div>
                </div>
            </div>
        </div>
    )


    function handleClick(e){
        // e.stopPropagation();

        Message(handle)
    }
}


const devChats = [
    {
        id: 3,
        time: 1725142641588,
        name: "Jacob",
        handle: "@Jayjay",
        msg: "Hello bruvver",
        status: "s"
    },
    {
        id: 7,
        time: 1725142622810,
        name: "John",
        handle: "@J_ohn",
        msg: "Hello bruvver",
        status: "s"
    },
    {
        id: 30,
        time: 1725142599711,
        name: "John, Peace",
        handle: "multiple",
        msg: "Hello bruvver",
        status: "s",
        receivers: ["@J_ohn", "@Peace1"]
    },
]