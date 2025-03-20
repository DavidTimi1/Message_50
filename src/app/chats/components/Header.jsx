
import { useContext } from "react";

import { ToggleOverlay } from "../../contexts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faPlus, faWifi, faXmark } from "@fortawesome/free-solid-svg-icons";
import { IconBtn } from "../../../components/Button";
import { UserContext } from "../../../contexts";
import { useOnlineStatus } from "../../components/Hooks";
import { ProdName } from "../../../App";

import placeholderImg from '../../../user-icon.svg';


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
                        <h4 className='hero-txt'> { ProdName } </h4>
                        <IconBtn icon={faMagnifyingGlass} onClick={startSearch}>
                            Search
                        </IconBtn>
                    </div>
                </div>
            </div>

            <div className="main-heading md-hidden lap">
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
                        <h4 className='hero-txt'> { ProdName } </h4>

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