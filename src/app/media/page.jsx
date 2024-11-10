import { Link } from "react-router-dom";


export const MediaPage = () => {

    return (
        <div className="abs-mid">
            <p className="fs-1 fw-1000"> 
                Welcome to Media and Storage | Message50 
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