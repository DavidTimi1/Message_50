import './page.css';

import { useContext, useEffect, useRef } from 'react';
import { ToggleOverlay } from '../contexts';
import { Heading } from './components/Heading';
import { Form } from './components/Form';



export const Feedback = ({ show }) => {
    const mainRef = useRef(null);
    const toggleOverlay = useContext(ToggleOverlay);

    useEffect(() => {
        if (show) {
            mainRef.current.showModal();
        } else {
            mainRef.current.close();
        }
    }, [show])

    return (
        <dialog className='feed-zone max br-5' ref={mainRef}>
            <div className='content max flex-col'>
                <Heading close={close} />
                <Form />
            </div>
        </dialog>
    )

    function close() {
        toggleOverlay('feedback', false);
    }
}

