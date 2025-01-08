import { useState } from "react";
import { timePast } from "../../../utils";
import { useContactName } from "../../components/Hooks";



export const MsgResultItem = ({ data }) => {
    const { id, time, handle, textContent, status } = data;
    const name = useContactName(handle);


    return (
        <div className='msg-res br-1' data-id={id} data-user={handle}>
            <div className='max mid-align flex gap-3 br-1' style={{ padding: "10px 5px" }}>
                <div className='dp-img flex'>

                </div>
                <div className="flex-col details grow gap-1">
                    <div className="flex fw" style={{ justifyContent: "space-between", alignItems: "baseline" }}>
                        <div className="user grow crop-excess" title={name}>
                            {handle !== "multiple" ? name : "Broadcast List"}
                        </div>
                        <small className='tl'>
                            <TimeBadge time={time} />
                        </small>
                    </div>
                    <div className="flex chat-msg fw" style={{ alignItems: "baseline" }}>
                        {status}
                        <span> {textContent} </span>
                    </div>
                </div>
            </div>
        </div>
    )
}


export const ContactResultItem = ({data}) => {
    const {id, name, handle, about} = data;


    return (
        <div className="contact-res br-5" data-user={id}>
            <div className="max gap-3 flex mid-align">
                <div className="dp-img">
                    {/* TODO */}
                </div>
                <div className="grow left-text flex-col">
                    <div className="fs-3 fw-800"> {name} </div>
                    {
                        about &&
                        <small className="crop-excess fw"> {about} </small>
                    }
                </div>
            </div>
        </div>
    )
}

function TimeBadge({ time }) {
    const [value, setValue] = useState(time);

    setTimeout(() => setValue(time), 60000);

    return (
        <>{value}</>
    )

}