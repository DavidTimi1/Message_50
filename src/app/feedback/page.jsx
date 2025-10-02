import './page.css';

import { useCallback, useContext, useEffect, useRef } from 'react';

import { StateNavigatorContext, ToggleOverlay } from '../contexts';
import { Heading } from './components/Heading';
import { Form } from './components/Form';


export const Feedback = ({ show }) => {
    const mainRef = useRef(null), navId = 'feedback';
    const toggleOverlay = useContext(ToggleOverlay);

    const { pushState, removeState } = useContext(StateNavigatorContext);

    const close = useCallback(() => {
        toggleOverlay('feedback', false);
    }, [toggleOverlay]);

    useEffect(() => {
        const dialog = mainRef.current;

        if (show) {
            pushState(navId, close); // incase nav buttons are used
            dialog.showModal();

        } else {
            dialog.close();
            removeState(navId)
        }
    }, [show]);


    return (
        <dialog className='feed-zone max br-5' ref={mainRef}>
            <div className='content max flex-col pad'>
                <Heading close={handleCloseClick} />
                <Form closeModal={handleCloseClick} />
            </div>
        </dialog>
    )


    function handleCloseClick() {
        close();
    }
}

