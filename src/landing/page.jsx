import { Link } from "react-router-dom";


export const LandingPage = () => {

    return (
        <div className="abs-mid">
            <p className="fs-1 fw-1000">
                Welcome to Message50 Landing Page
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