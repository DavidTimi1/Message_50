import { faComments } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext } from "react";
import { ToggleOverlay } from "../../contexts";


export const Help = () => {
    const title = "Help and Feedback", descr = "Help, contact us, report a bug";

    const toggleOverlay = useContext( ToggleOverlay );

    return (
        <div className="fw settings-sec br-5">
            <button className="no-btn fw br-5" onClick={handleClick}>
                <h3 className="no-accordion flex mid-align gap-4">
                    <FontAwesomeIcon icon={faComments} />
                    <div className="flex-col">
                        <span className="setting-head"> {title} </span>
                        <small> {descr} </small>
                    </div>
                </h3>
            </button>
        </div>
    )

    function handleClick(){
        toggleOverlay('feedback', 1);
    }
}