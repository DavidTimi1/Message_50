import { Link } from "react-router-dom";


export const NotificationsPage = () => {

    return (
        <div className="abs-mid">
            <p className="fs-1 fw-1000">
                Welcome to Notifications | Message50
            </p>
            <small className="fw-100">
                Oops! Nothing here yet!
            </small>
            <div>
                <Link to='/routes'>
                    {"Routes >"}
                </Link>
            </div>
        </div>
    )
}