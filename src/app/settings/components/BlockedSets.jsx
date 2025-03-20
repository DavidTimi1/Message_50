import { faAngleDown, faCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


export const Blocked = ({isActive, toggleActive}) => {
    const title = "Blocked Users";

    return (
        <div className="settings-sec fw br-5">
            <div>
                <button onClick={toggleActive} className="fw br-5 no-btn acc-btn" type="button" aria-expanded={isActive} aria-controls="#blocked-users-more">
                    <h3 className="flex mid-align gap-4">
                        <FontAwesomeIcon icon={faCircle} />
                        <span className="setting-head grow"> {title} </span>
                        <div className="rot-icon" style={{transform: isActive? "rotate(180deg)" : '' }} >
                            <FontAwesomeIcon icon={faAngleDown} />
                        </div>
                    </h3>
                </button>
            </div>

            {
                isActive &&
                <div id="blocked-users-more" className="sets-more">
                    <div className="accordion-body">
                        {
                            blocked.length?
                                <ul>
                                    {
                                        blocked.map( user =>
                                            <li key={user.handle}>
                                                <button className="fw">{User.username}</button>
                                            </li>
                                        )
                                    }
                                </ul>
                            :
                                <small>
                                    No user has been blocked
                                </small>
                        }
                    </div>
                </div>
            }
        </div>
    )
}

const blocked = [];