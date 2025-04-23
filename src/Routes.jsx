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
                        Message50 Landing Page
                    </Link>
                </li>
                <li>
                    <Link to='/login'>
                        Login Page
                    </Link>
                </li>
                <li>
                    <Link to='/register'>
                        Registration Page
                    </Link>
                </li>
                <li>
                    <Link to='/app'>
                        Message50 App
                    </Link>
                </li>
                <li>
                    <Link to='/routes'>
                        Dev Routes : (Current)
                    </Link>
                </li>
            </ul>
        </div>
    )
}