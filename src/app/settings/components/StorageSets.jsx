import { faFolder } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";


export const StorageSettings = () => {
    const title = "Manage Storage", descr = "Media files: photos, videos, audios, other";
    
    const navigate = useNavigate();

    return (
        <div className="fw settings-sec br-5">
        <button className="no-btn fw br-5" onClick={handleClick}>
            <h3 className="flex mid-align gap-4">
                <FontAwesomeIcon icon={faFolder} />
                <div className="flex-col">
                    <span className="setting-head"> {title} </span>
                    <small className="dets setting-more"> {descr} </small>
                </div>
            </h3>
        </button>
        </div>
    )

    function handleClick(){
        navigate('/app/media', {replace: true})
    }
}