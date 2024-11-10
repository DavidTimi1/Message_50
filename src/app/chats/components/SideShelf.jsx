import { useContext } from 'react';
import { ToggleOverlay } from '../../contexts';


export const SideShelf = ({ searchContacts }) => {
    const toggleOverlay = useContext(ToggleOverlay);

    return (
        <div className="side-shelf abs gap-2">
            <button onClick={openAIChat}>
                <img src="static/ai-chat-icon.svg" alt='' />
            </button>
            <button onClick={searchContacts}>
                <img src="static/new-chat.svg" alt='' />
            </button>
        </div>
    )


    function openAIChat() {
        toggleOverlay('ai-chat', true);
    }
}