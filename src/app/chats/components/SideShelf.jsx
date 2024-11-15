import aiChatIcon from '../assets/ai-chat-icon.svg';
import newChatIcon from '../assets/new-chat.svg';

import { useContext } from 'react';
import { ToggleOverlay } from '../../contexts';


export const SideShelf = ({ searchContacts }) => {
    const toggleOverlay = useContext(ToggleOverlay);

    return (
        <div className="sideshelf abs gap-1 flex-col mob">
            <button className="no-btn icon-btn" onClick={openAIChat}>
                <div className="abs-mid btn-bg fw"></div>
                <div className='img-txt'>
                    <img src={aiChatIcon} alt='' className='fw' style={{objectFit: "contain"}} />
                </div>
                <span className="sr-only"> AI chatbot </span>
            </button>
            <button className="no-btn icon-btn" onClick={searchContacts}>
                <div className="abs-mid btn-bg fw"></div>
                <div className='img-txt'>
                    <img src={newChatIcon} alt='' className='fw' style={{objectFit: "contain"}} />
                </div>
                <span className="sr-only"> search contacts </span>
            </button>
        </div>
    )


    function openAIChat() {
        toggleOverlay('ai-chat', true);
    }
}