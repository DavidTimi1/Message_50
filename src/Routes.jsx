import { Link } from "react-router-dom";


export const AppRoutes = () => {

    return (
        <div className="abs-mid">
            <p className="fs-1 fw-1000"> 
                Welcome to Routes | Message50 
            </p>
            <small className="fw-100">
                For development purposes only!
            </small>
            <ul>
                <li>
                    <Link to='/'>
                        Landing Page
                    </Link>
                </li>
                <li>
                    <Link to='/app'>
                        Msg50App
                    </Link>
                </li>
                <li>
                    <Link to='/routes'>
                        Dev Routes
                    </Link>
                </li>
                <li>
                    <Link to='/signin'>
                        SignIn | Msg50
                    </Link>
                </li>
            </ul>
        </div>
    )
}