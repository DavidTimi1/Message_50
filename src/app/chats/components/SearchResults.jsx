import { useState } from "react";
import { standardUnit, timePast } from "../../../utils";
import { useContactName } from "../../components/Hooks";
import { UserProfilePic } from "../../contacts/components/ContactItem";
import StatusIcon from "../../components/status";
import { TimePast } from "./ChatList";



export const MsgResultItem = ({ data }) => {
    const { id, time, handle, textContent, status } = data;
    const name = useContactName(handle);


    return (
        <div className='msg-res br-1' data-id={id} data-user={handle}>
            <div className='max mid-align flex gap-3 br-1' style={{ padding: "10px 5px" }}>
                <UserProfilePic handle={handle} />

                <div className="flex-col details grow gap-1">
                    <div className="flex fw" style={{ justifyContent: "space-between", alignItems: "baseline" }}>
                        <div className="user grow crop-excess" title={name}>
                            {handle !== "multiple" ? name : "Broadcast List"}
                        </div>
                        <small className='tl'>
                            <TimePast time={time} />
                        </small>
                    </div>
                    <div className="flex chat-msg fw mid-align" style={{ alignItems: "baseline" }}>
                        <StatusIcon statusChar={status} />
                        <span> {textContent} </span>
                    </div>
                </div>
            </div>
        </div>
    )
}


export const ContactResultItem = ({data}) => {
    const {id, handle, bio, dp} = data;
    const name = useContactName(handle);

    return (
        <div className="contact-res br-5" data-user={id}>
            <div className="max gap-3 flex mid-align">
                <UserProfilePic dp={dp} handle={handle} />

                <div className="grow left-text flex-col">
                    <div className="fs-3 fw-800"> {name} </div>
                    {
                        bio &&
                        <small className="crop-excess fw"> {bio} </small>
                    }
                </div>
            </div>
        </div>
    )
}