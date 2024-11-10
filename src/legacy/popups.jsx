import { useEffect, useRef, useState } from "react";

import { Button, IconBut } from "../buttons";
import ProfilePic from "./contacts";
import { on, once, transitionEnd } from "../ui/helpers";


export function Slides({ children, show, closePopUp }) {
    const popRef = useRef(null);

    useEffect(() => {
        const t_id = show && setTimeout(() => popRef.current.classList.remove("close"), 50);

        return () => {
            t_id && clearTimeout(t_id);
        }
    }, [show]);


    return (
        <div className="popup-window close" ref={popRef}>
            <div className="container fw">
                <div className="heading fw">
                    <IconBut className="fa-solid fa-xmark lg" onClick={close} />
                    <div>
                        <div className="notch"></div>
                    </div>
                </div>
                <div className="content custom-scroll">
                    {children}
                </div>
            </div>
        </div>
    )

    function close() {
        once(transitionEnd, popRef.current, closePopUp);
        popRef.current.classList.add("close");
    }
}


export function ContactCard({ show, args }) {
    const [details, setDetails] = useState({ pending: true });
    const { pending, error, dp, name, username, status, saved, about } = details;

    // get details
    setTimeout(_ => setDetails({ error: true }), 5000);



    return (
        <Slides>
            {
                pending ?
                    <div className="fw center-text">
                        <i className="fa-solid fa-spinner fa-spin"></i>
                    </div>
                    :
                    error ?
                        <div className="fw">
                            <div className="err-note fw"> {error} </div>
                            <Button className="btn-outline-secondary mixed">
                                Retry
                            </Button>
                        </div>
                        :
                        <div className="fw gap-2">
                            <div className="contact-dp">
                                <ProfilePic src={dp} />
                            </div>
                            <div className="details center-text">
                                <div> {name} </div>
                                {name !== username && <div> {username} </div>}
                                <div> {status} </div>
                            </div>
                            <div className="actions flex mid-align even-space">
                                <Button>
                                    <div className="flex-col gap-1">
                                        <i className="fa-solid fa-message"></i>
                                        <small>Message</small>
                                    </div>
                                </Button>

                                {
                                    saved &&
                                    <Button>
                                        <div className="flex-col gap-1">
                                            <i className="fa-solid fa-pencil"></i>
                                            <small>Edit</small>
                                        </div>
                                    </Button>
                                }

                                <Button>
                                    <div className="flex-col gap-1">
                                        <i className="fa-solid fa-save"></i>
                                        <small>Add to Contacts</small>
                                    </div>
                                </Button>

                            </div>

                            <hr></hr>

                            <div className="flex-col gap-1">
                                <small> About </small>
                                <div className="crop-excess-2">
                                    {about}
                                </div>
                            </div>

                            <hr></hr>

                            <div className="danger fw flex-col gap-1">
                                <Button className="flex mid-align fw gap-1">
                                    <i className="fa-solid fa-flag"></i>
                                    Report & Block
                                </Button>
                                <Button className="flex mid-align fw gap-1">
                                    <i className="fa-solid fa-cirle-slash"></i>
                                    Block
                                </Button>
                            </div>
                        </div>

            }

        </Slides>
    )
}