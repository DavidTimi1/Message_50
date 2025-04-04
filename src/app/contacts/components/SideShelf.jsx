import { useContext } from 'react';
import { ToggleOverlay } from '../../contexts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUser, faUsers } from '@fortawesome/free-solid-svg-icons';
import { IconBtn } from '../../../components/Button';


export const SideShelf = () => {
    const toggleOverlay = useContext(ToggleOverlay);

    return (
        <div className="sideshelf abs">
            <div className="gap-2 flex-col mob">
                <button className="no-btn icon-btn upgrade-required" onClick={bulkImport}>
                    <div className="abs-mid btn-bg fw"></div>
                    <FontAwesomeIcon icon={faUsers} size="xl" />
                    <span className='abs xtra'>
                        <FontAwesomeIcon icon={faPlus} size="lg" />
                    </span>
                    <span className="sr-only"> Bulk import contacts from phone </span>
                </button>


                <button className="no-btn icon-btn" onClick={newContact}>
                    <div className="abs-mid btn-bg fw"></div>
                    <FontAwesomeIcon icon={faUser} size="xl" />
                    <span className='abs xtra'>
                        <FontAwesomeIcon icon={faPlus} size="lg" />
                    </span>
                    <span className="sr-only"> Create new contact </span>
                </button>
            </div>
        </div>
    )

    function bulkImport(){

    }


    function newContact() {
        toggleOverlay('manage-contact', {NEW: true});
    }
}
