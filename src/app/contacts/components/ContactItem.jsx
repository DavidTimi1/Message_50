import { faEllipsis } from "@fortawesome/free-solid-svg-icons"
import { IconBtn } from "../../../components/Button"
import { useContext } from "react";
import { ChatContext, ToggleOverlay } from "../../contexts";


export const ContactItem = ({data, Message}) => {
    const {id, name, handle, bio} = data;

    const toggleOverlay = useContext(ToggleOverlay);


    return (
        <div className="contact-cont br-5" data-id={id}>
            <div className="max gap-3 flex mid-align">
                <div className="dp-img">
                    {/* TODO */}
                </div>
                <div className="grow left-text flex-col">
                    <div className="fs-3 fw-800"> {name} </div>
                    {
                        bio &&
                        <small className="crop-excess fw"> {bio} </small>
                    }
                </div>
                <div className="dropdown">
                    <label data-bs-toggle="dropdown" aria-expanded={false}>
                        <IconBtn icon={faEllipsis} />
                    </label>

                    <ul className="dropdown-menu">
                        <li><button className="dropdown-item" data-action='view' onClick={viewContact}>View Contact</button></li>
                        <li><button className="dropdown-item" data-action='edit' onClick={editContact}>Edit Contact</button></li>
                        <li><button className="dropdown-item" data-action='message' onClick={messageContact}>Message Contact</button></li>
                    </ul>
                </div>
            </div>
        </div>
    )

    function messageContact(){
        Message(handle);
    }

    function viewContact(){
        toggleOverlay('user-card', true);
    }

    function editContact(){
        toggleOverlay('manage-contact', {id: id})
    }
}