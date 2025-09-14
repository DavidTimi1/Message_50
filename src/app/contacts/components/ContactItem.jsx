import { faEllipsis } from "@fortawesome/free-solid-svg-icons"
import { IconBtn } from "../../../components/Button"
import { useContext, useEffect, useState } from "react";
import { ToggleOverlay } from "../../contexts";
import { useOnlineStatus } from "../../components/Hooks";
import { useUserDetails } from "@/hooks/use-user-details";

const placeholderImg = '/user-icon.svg'; 


export const ContactItem = ({data, Message}) => {
    const {id, name, handle, bio, dp} = data;

    const toggleOverlay = useContext(ToggleOverlay);


    return (
        <div className="contact-cont br-5" data-id={id}>
            <div className="max gap-2 flex mid-align">

                <UserProfilePic handle={handle} dp={dp ?? placeholderImg}  />

                <div className="grow left-text flex-col">
                    <div className="fs-4 fw-800"> {name} </div>
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
        toggleOverlay('user-card', {id: handle});
    }

    function editContact(){
        toggleOverlay('manage-contact', {id: handle})
    }
}



export function UserProfilePic({handle, dp, width=""}){
    const isOnline = useOnlineStatus();
    const {data: userDetails} = useUserDetails(handle);
    const newDp = userDetails?.dp || dp;

    return(
        <div className="dp-img" style={{backgroundImage: `url(${newDp || placeholderImg})`, width: width}}></div>
    )

}