
import { useContext } from "react";

import { ToggleOverlay } from "../../contexts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faPlus, faWifi, faXmark } from "@fortawesome/free-solid-svg-icons";


export const Header = ({ startSearch }) => {
    const toggleOverlay = useContext(ToggleOverlay);

    return (
        <header className="app-heading">
            <div className="main-heading mob">
                <div className='flex gap-2 mid-align'>
                    <button className="no-btn" type="button" onClick={openNavBar}>
                        <div className='dp-img' style={{ backgroundColor: "grey", width: "35px" }}>
                            {/* profile pic */}
                        </div>
                        <span className="no-wifi-icon abs">
                            <FontAwesomeIcon icon={faWifi} />
                            <span className="abs-mid" style={{ textShadow: "0 0 2px white" }}>
                                <FontAwesomeIcon icon={faXmark} color="red" />
                            </span>
                        </span>
                    </button>
                    <div className='flex grow mid-align' style={{ justifyContent: "space-between" }}>
                        <h4 className='hero-txt'> Message50 </h4>
                        <button onClick={startSearch}>
                            <div className="flex mid-align gap-2">
                                <FontAwesomeIcon icon={faMagnifyingGlass} size="xl" />
                                <span className='sr-only'>
                                    Search
                                </span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            <div className="main-heading lap">
                <div className='flex'>
                    <div className='fs-2'> Chats </div>
                    <div className='flex mid-align gap-2'>
                        <button>
                            <div className="flex mid-align gap-2">
                                <FontAwesomeIcon icon={faPlus} />
                                <span>New Chat</span>
                            </div>
                        </button>
                        <button>
                            <div className="flex mid-align gap-2">
                                <FontAwesomeIcon icon={faPlus} />
                                <span>AI Chat</span>
                            </div>
                        </button>
                        <h4 className='hero-txt'> Message50 </h4>
                    </div>
                </div>
            </div>
        </header>
    )


    function openNavBar() {
        toggleOverlay("navbar", true);
    }
}