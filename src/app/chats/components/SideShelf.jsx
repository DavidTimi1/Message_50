import styles from '../page.module.css';

import { useContext } from 'react';
import { ToggleOverlay } from '../../contexts';


export const SideShelf = ({ searchContacts }) => {
    const toggleOverlay = useContext(ToggleOverlay);

    return (
        <div className={`${styles.sideshelf} abs gap-1 flex-col mob`}>
            <button onClick={openAIChat}>
                <div className={`${styles.bg} fw`}>
                    <img src="static/ai-chat-icon.svg" alt='' className='abs-mid' />
                </div>
            </button>
            <button onClick={searchContacts}>
                <div className={`${styles.bg} fw`}>
                    <img src="static/new-chat.svg" alt='' className='abs-mid' />
                </div>
            </button>
        </div>
    )


    function openAIChat() {
        toggleOverlay('ai-chat', true);
    }
}