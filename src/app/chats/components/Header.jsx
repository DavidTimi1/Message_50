
import { useContext } from "react";

import { ToggleOverlay } from "../../contexts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faPlus, faWifi, faXmark } from "@fortawesome/free-solid-svg-icons";
import { IconBtn } from "../../../components/Button";
import { UserContext } from "../../../contexts";
import { useOnlineStatus } from "../../components/Hooks";
import { ProdName } from "../../../App";

const placeholderImg = '/user-icon.svg'; 


export const Header = ({ startSearch }) => {
    const toggleOverlay = useContext(ToggleOverlay);
    const userDp = useContext(UserContext).dp;

    const isOnline = useOnlineStatus();

    return (
        <header className="app-heading">
            <div className="main-heading hide md-block">
                <div className='flex gap-2 mid-align'>
                    <button className="no-btn" type="button" onClick={openNavBar}>
                        <div className='dp-img' style={{
                                backgroundImage: `url(${userDp || placeholderImg})` ,
                                width: "35px" 
                            }}
                        />
                        
                        {
                            !isOnline &&
                            <span className="no-wifi abs">
                                <FontAwesomeIcon icon={faWifi} />
                                <span className="abs-mid" style={{ textShadow: "0 0 5px var(--body-col)" }}>
                                    <FontAwesomeIcon icon={faXmark} color="red" />
                                </span>
                            </span>
                        }
                    </button>
                    <div className='flex grow mid-align' style={{ justifyContent: "space-between" }}>
                        <h2 className='hero-txt m-0 fs-4'> { ProdName } </h2>
                        <IconBtn icon={faMagnifyingGlass} onClick={startSearch}>
                            Search
                        </IconBtn>
                    </div>
                </div>
            </div>

            <div className="main-heading md-hidden lap">
                <div className='flex'>
                    <h2 className='fs-2'> Chats </h2>
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
                        <h3 className='hero-txt fs-4'> { ProdName } </h3>

                        {
                            !isOnline &&
                            <span className="no-wifi">
                                <FontAwesomeIcon icon={faWifi} />
                                <span className="abs-mid" style={{ textShadow: "0 0 5px var(--body-col)" }}>
                                    <FontAwesomeIcon icon={faXmark} color="red" />
                                </span>
                            </span>
                        }
                    </div>
                </div>
            </div>
        </header>
    )


    function openNavBar() {
        toggleOverlay("navbar", true);
    }
}