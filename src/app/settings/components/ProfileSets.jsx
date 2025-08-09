import { useContext, useEffect, useRef, useState } from "react";
import { StateNavigatorContext, ToggleOverlay } from "../../contexts";
import { UserContext } from "../../../contexts";
import { IconBtn, Button } from "../../../components/Button";
import { faAngleLeft, faCamera, faNoteSticky, faPencil, faShare, faUser } from "@fortawesome/free-solid-svg-icons";
import { on, once, transitionEnd } from "../../../utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const placeholderImg = '/user-icon.svg';
import axiosInstance from "../../../auth/axiosInstance";
import { API_ROUTES } from "../../../lib/routes";



export const ProfileBrief = () => {
    const toggleOverlay = useContext(ToggleOverlay);
    const User = useContext(UserContext);


    return (

        <div className="settings-sec fw br-5">
            <div className="flex mid-align gap-2">
                <button className="no-btn flex mid-align grow gap-4" onClick={showUserCard}>
                    <div className="dp-img" style={{ width: "70px", backgroundImage: `url(${User.dp || placeholderImg})`, backgroundSize: "cover" }}>
                    </div>
                    <div className="grow">
                        <div className="flex-col">
                            <div className="left-text"> {User.username} </div>
                            <small className="fw crop-excess"> {User.email} </small>
                        </div>
                    </div>
                </button>

                <div className='flex mid-align gap-2' style={{ color: "var(--btn-col)" }}>
                    <div>
                        <IconBtn icon={faShare} onClick={shareProfile}>
                            Share contact
                        </IconBtn>
                    </div>
                    <div>
                        <IconBtn icon={faPencil} onClick={editProfile}>
                            Edit profile
                        </IconBtn>
                    </div>
                </div>
            </div>
        </div>
    )

    function editProfile() {
        toggleOverlay('profile-edit', true);
    }

    function showUserCard() {
        toggleOverlay('user-card', true);
    }

    function shareProfile() {
        const shareData = {
            title: `${User.username}'s profile`,
            text: "You can contact me on this quick and secure messaging platform",
            url: `/user/${User.username}`
        }

        navigator.share(shareData)
    }
}


export const ProfileEdit = ({ show }) => {
    const title = "Profile Information";
    const ref = useRef(null), navId = 'profile-edit';

    const toggleOverlay = useContext(ToggleOverlay);
    const User = useContext(UserContext), userDp = User.dp;
    const [error, setError] = useState();

    const { pushState, removeState } = useContext(StateNavigatorContext);

    const [dp, setDp] = useState(userDp);


    // Close function with animation handling
    const close = () => {
        // Trigger animation class
        if (ref.current) {
            ref.current.classList.add("close");

        } else {
            setTimeout(handleTransitionEnd);
        }

        // Wait for the transition/animation to complete
        once(transitionEnd, ref.current, handleTransitionEnd);

        function handleTransitionEnd() {
            toggleOverlay(navId, false);
        }
    }


    useEffect(() => {

        let t_id, ignore = false;

        if (show) {

            t_id = setTimeout(() => {
                if (ignore) return

                pushState(navId, close); // incase nav buttons are used
                ref.current.classList.remove("close")
            }, 100)

        }

        return () => {
            t_id && clearTimeout(t_id);
            ignore = true;
        }

    }, [show, navId, pushState, close]);


    return (
        show &&
        <div className="interface close edit-profile" ref={ref}>
            <div className="max custom-scroll" style={{ overflow: "hidden auto" }}>
                <div className="fw flex mid-align gap-2" style={{ padding: "10px" }}>
                    <IconBtn icon={faAngleLeft} onClick={handleCloseClick}>
                        <span className="sr-only"> Close </span>
                    </IconBtn>
                    <h3 className="fs-5"> {title} </h3>
                </div>

                {
                    error &&
                    <div className="err-msg">
                        {error}
                    </div>
                }

                <form method="post" onSubmit={handleSubmit} action="" className="fw pad grow">
                    <div className="mx-auto thmb">
                        <div className="img-dp" style={{ width: "150px" }} >
                            <img src={dp ?? placeholderImg} alt="user profile picture" className="max" />
                        </div>
                        <div className='abs'>
                            <DPBtn setProfile={setProfile} />
                        </div>
                    </div>
                    <ProfileForm />
                </form>
            </div>
        </div>
    )

    function handleCloseClick() {
        return new Promise(res => {
            const el = ref.current;
            if (!el) {
                res(false);
                return;
            }

            // If already closing, resolve immediately
            if (el.classList.contains("close")) {
                res(removeState(navId));
                return;
            }

            // Attach listener before triggering transition
            once(transitionEnd, el, () => {
                res(removeState(navId));
            });

            el.classList.add("close");
        });
    }


    function setProfile(data) {
        if (!data) return

        const url = URL.createObjectURL(data);
        setDp(url);

    }

    function handleSubmit(e) {
        e.preventDefault();

        const fd = new FormData(e.target);

        axiosInstance.post( API_ROUTES.PROFILE_EDIT , fd)
        .then(() => {
            User.reload();

        }).catch(err => {
            setError(err.response?.data?.detail || err.message || "An error occurred. Please try again.")
            console.error(err);
        })
    }
}


const DPBtn = ({ setProfile }) => {

    return (
        <label className="no-btn icon-btn" >
            <div className="abs-mid btn-bg fw" style={{ "--bg": "var(--btn-col)" }}></div>
            <FontAwesomeIcon icon={faCamera} size="xl" color="white" />
            <input onInput={handleInput} type="file" accept="image/*" name="dp" className="hide" />

            <span className="sr-only">
                Take a picture
            </span>
        </label>
    )

    function handleInput(e) {
        const { target: { files } } = e;

        if (files?.[0]) setProfile(files[0]);
    }
}


const ProfileForm = () => {
    const { username, bio } = useContext(UserContext);
    const nameRef = useRef(null), bioRef = useRef(null);

    useEffect(() => {
        nameRef.current.value = username;
        bioRef.current.value = bio;

    }, [bio, username])

    useEffect(() => {
        let f;

        on('beforeunload', f = e => {
            const leaveMsg = "Changes you made may not be saved."
            e.returnValue = leaveMsg;

            return leaveMsg
        })

        return () => window.removeEventListener('beforeunload', f)
    })


    return (
        <div className="form-body">
            <div className="flex-col fw gap-2">

                <label className="nv-input fw br-1">
                    <div className="fw flex mid-align gap-2">
                        <FontAwesomeIcon icon={faUser} size="xl" />
                        <div className="flex-col gap-1">
                            <small> Username </small>
                            <input className="fw" ref={nameRef} readOnly />
                        </div>
                    </div>
                </label>
                <label className="nv-input fw br-1">
                    <div className="fw flex mid-align gap-2">
                        <FontAwesomeIcon icon={faNoteSticky} size="xl" />
                        <div className="flex-col fw gap-1">
                            <small className="flex" style={{ justifyContent: "space-between" }}>
                                <span> bio </span>
                                <span> 100 characters </span>
                            </small>
                            <textarea className="fw" name="bio" ref={bioRef} maxLength="100" placeholder="Enter a short bio ..."></textarea>
                        </div>
                    </div>
                </label>

                <div className='flex fw' style={{ position: "sticky", bottom: "10px", justifyContent: "right" }}>
                    <Button type="submit"> Save </Button>
                </div>
            </div>
        </div>
    )
}
