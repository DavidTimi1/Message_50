import { Suspense, useContext, useRef } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { UserContext } from "../contexts";
import axios from "axios";

import placeholderDp from '../user-icon.svg';
import { apiHost } from "../App";
import Navbar from "../landing/Navbar";
import { useTransitionOnLoad } from "../app/components/Hooks";


const UserProfilePage = () => {
    const { username } = useParams(); // Get the username from the URL
    const currentUser = useContext(UserContext).username;

    if (!username) {
        return <Navigate to="/app" replace />;
    }

    if (currentUser){
        return <Navigate to="/app" state={{showUser: username}} replace />;
    }

    return (
        <div className='user-page max'>
            <Navbar scroll={false} />

            <Suspense fallback={<LoadingUserBrief />}>
                <UserBrief username={username} />
            </Suspense>
        </div>
    )
}

const LoadingUserBrief = () => (
    <div className="user-profile mx-auto flex-col gap-5" style={{padding: "50px"}}>
        <div className="flex-col gap-2 mid-align">
            <div className="dp-img" style={{ width: "70px" }}>
            </div>

            <p style={{width: "50%", backgroundColor: "var(--text2-col)"}}></p>
        </div>
</div>
)


const UserBrief = ({username}) => {
    const userAPIRoute = apiHost + "/chat/api/user/" + username;
    const ref = useRef();
    useTransitionOnLoad(ref);

    const userDetails = axios.get(userAPIRoute)
    .then ( ({data}) => ({
        dp: data.dp,
        bio: data.bio
    }))

    const {bio, dp} = userDetails;

    return (
        <div className="user-profile mx-auto flex-col gap-5 can-animate not-animated" style={{padding: "50px"}} ref={ref}>
            <div className="flex-col gap-2 mid-align">
                <div className="dp-img" style={{ width: "70px", backgroundImage: `url(${dp || placeholderDp})`, backgroundSize: "cover" }}>
                </div>
                { bio && <p>Bio: {bio}</p> }
                <p>Sign in to chat with <span style={{fontSize: "larger", color: "var(--btn-col)"}}> {username} </span>.</p>
                <Link to={`/login?next=${window.location.pathname}`} className="my-btn no-link br-5">
                    <div className="btn-bg">
                        <div className="btn max">
                            Sign In
                        </div>
                    </div>
                </Link>
            </div>
    </div>
    );
};



export default UserProfilePage;