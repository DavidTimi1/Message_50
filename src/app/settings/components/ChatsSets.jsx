import { faAngleDown, faMessage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { changeTheme, getTheme } from "../../../theme";
import { useState } from "react";



export const ChatSettings = ({isActive, toggleActive}) => {
    const title = "Chats", descr = "Theme, wallpaper";
    const [theme, setTheme] = useState(getTheme());

    return (
        <div id="chat-sets" className="settings-sec br-5">
            <div>
                <button onClick={toggleActive} className="fw br-5 no-btn acc-btn" type="button" aria-expanded={isActive} aria-controls="#chat-sets-more">
                    <h3 className="fw flex mid-align gap-2">
                        <div className="grow flex mid-align gap-4">
                            <FontAwesomeIcon icon={faMessage} />
                            <div className="flex-col">
                                <span className="setting-head"> {title} </span>
                                <small className="setting-more"> {descr} </small>
                            </div>
                        </div>
                        <div className="rot-icon" style={{transform: isActive? "rotate(180deg)" : '' }} >
                            <FontAwesomeIcon icon={faAngleDown} />
                        </div>
                    </h3>
                </button>
            </div>

            {
                isActive &&
                <div id="chat-sets-more" className="sets-more">
                    <div className="accordion-body flex-col gap-2">
                        <div className="theme-sets set-group">
                            <h6>Theme</h6>
                            <div className="fw flex mid-align space-out col" style={{ marginLeft: "5px" }}>
                                <label className="fw">
                                    <input type="radio" name="theme" onChange={handleChange} checked={theme === 'light'} value="light" />
                                    <span> Light </span>
                                </label>
                                <label className="fw">
                                    <input type="radio" name="theme" value="dark" onChange={handleChange} checked={theme === 'dark'} />
                                    <span> Dark </span>
                                </label>
                            </div>
                        </div>
                        <div className="font-sets set-group">
                            <h6>Font Size</h6>
                            <label className="block" style={{ width: "80%", margin: "auto" }}>
                                <small className="fw block flex center-text" style={{ justifyContent: "space-between" }}>
                                    <span>Small</span>
                                    <span>Medium</span>
                                    <span>Large</span>
                                </small>
                                <input className="fw" type="range" step="50" min="0" max="100" />
                            </label>
                        </div>
                    </div>
                </div>
            }
        </div>
    )

    function handleChange(e){
        const {target} = e, value = target.value, curTheme = getTheme();

        if (curTheme !== value){
            setTheme( changeTheme() )
        }
    }
}