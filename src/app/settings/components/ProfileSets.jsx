import { useContext, useEffect, useRef, useState } from "react";
import { StateNavigatorContext, ToggleOverlay } from "../../contexts";
import { UserContext } from "../../../contexts";
import { IconBtn } from "../../components/Button";
import { faAngleLeft, faCamera, faNoteSticky, faPencil, faShare, faUser } from "@fortawesome/free-solid-svg-icons";
import { Button } from "../../../buttons";
import { on, once, transitionEnd } from "../../../utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";



export const ProfileBrief = () => {
    const toggleOverlay = useContext(ToggleOverlay);
    const User = useContext(UserContext);


    return (

        <div className="settings-sec fw br-5">
            <div className="flex mid-align gap-2">
                <button className="no-btn flex mid-align grow gap-4" onClick={showUserCard}>
                    <div className="dp-img" style={{ width: "70px", backgroundImage: `url(${User.dp})`, backgroundSize: "cover" }}>
                    </div>
                    <div className="grow">
                        <div className="flex-col mid-align">
                            <div className="left-text"> {User.name} </div>
                            <small className="fw crop-excess"> {User.handle} </small>
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
        toggleOverlay('profile-edit', 1);
    }

    function showUserCard(){
        toggleOverlay('user-card', 1);
    }

    function shareProfile(){
        const shareData = {
            title: `${User.name}'s profile`,
            text: "You can contact me on this quick and secure messaging platform",
            url: `https://localhost:3000/users/${User.handle.slice(1)}`
        }

        navigator.share(shareData)
    }
}


export const ProfileEdit = ({ show }) => {
    const title = "Profile Information";
    const ref = useRef(null),navId = 'profile-edit';

    const toggleOverlay = useContext(ToggleOverlay);
    const userDp = useContext(UserContext).dp;

    const { pushState, removeState } = useContext( StateNavigatorContext );

    const [dp, setDp] = useState(userDp);


    // Close function with animation handling
    const close = () => {
        // Trigger animation class
        if (ref.current){
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

        if (show){

            t_id = setTimeout(() => {
                if (ignore) return

                pushState( navId, close ); // incase nav buttons are used
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
            <div className="max custom-scroll" style={{overflow: "hidden auto"}}>
                <div className="fw flex mid-align gap-2" style={{padding: "10px"}}>
                    <IconBtn icon={faAngleLeft} onClick={handleCloseClick}>
                        <span className="sr-only"> Close </span>
                    </IconBtn>
                    <h3> {title} </h3>
                </div>
                <form method="post" action="" className="fw pad grow">
                    <div className="mx-auto thmb">
                        <div className="img-dp" style={{width: "150px"}} >
                            <img src={dp} alt="user profile picture" className="max" />
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


    function handleCloseClick(){
        // go back in history to trigger close
        return new Promise( res => {
            once(transitionEnd, ref.current, () =>{
                res( removeState(navId) );
            });

            ref.current.classList.add("close");
        })        
    }

    function setProfile(data){
        if (!data) return 

        const url = URL.createObjectURL(data);
        setDp(url);

    }
}


const DPBtn = ({setProfile}) => {

    return (
        <label className="no-btn icon-btn" >
            <div className="abs-mid btn-bg fw" style={{"--bg": "var(--btn-col)"}}></div>
            <FontAwesomeIcon icon={faCamera} size="xl" color="white" />
            <input onInput={handleInput} type="file" accept="image/*" className="hide" />

            <span className="sr-only"> 
                Take a picture
            </span>
        </label>
    )

    function handleInput(e){
        const {target: {files}} = e;

        if (files?.[0]) setProfile(files[0]);
    }
}


const ProfileForm = () => {
    const { name, about } = useContext(UserContext);
    const nameRef = useRef(null), aboutRef = useRef(null);

    useEffect(() => {
        nameRef.current.value = name;
        aboutRef.current.value = about;

    }, [about, name])

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
                    <div className="fw flex mid-align gap-3">
                        <FontAwesomeIcon icon={faUser} size="xl" />
                        <div className="flex-col gap-1">
                            <small> Username </small>
                            <input className="fw" ref={nameRef} contentEditable="false" />
                        </div>
                    </div>
                </label>
                <label className="nv-input fw br-1">
                    <div className="fw flex mid-align gap-3">
                        <FontAwesomeIcon icon={faNoteSticky} size="xl" />
                        <div className="flex-col fw gap-1">
                            <small className="flex" style={{justifyContent: "space-between"}}>
                                <span> About </span>
                                <span> 100 characters </span>
                            </small>
                            <textarea className="fw" ref={aboutRef} maxLength="100"></textarea>
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
