import { useContext, useEffect, useRef } from "react";
import { ToggleOverlay } from "../../contexts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAt } from "@fortawesome/free-solid-svg-icons/faAt";
import { IconBtn } from "../../components/Button";
import { faCheck, faTrashCan, faXmark } from "@fortawesome/free-solid-svg-icons";
import { Button } from "../../../buttons";
import { once, transitionEnd } from "../../../utils";



export const ManageContact = ({ show, args }) => {
    const {NEW, id} = show ? args : {} ;
    const title = `${NEW? "Create" : "Edit"} Contact`;

    const ref = useRef(null);
    const toggleOverlay = useContext(ToggleOverlay);

    useEffect(() => {
        let t_id = show && setTimeout(() => ref.current.classList.remove("close"));

        return () => {
            t_id && clearTimeout(t_id);
        }
    }, [show])


    return (
        show &&
        <div className="interface close manage-contact" ref={ref}>
            <div className="max custom-scroll" style={{overflow: "hidden auto"}}>
                <div className="fw flex mid-align gap-2" style={{padding: "10px"}}>
                    <IconBtn icon={faXmark} onClick={close}>
                        <span className="sr-only"> Close </span>
                    </IconBtn>
                    <h3> {title} </h3>
                </div>
                
                <Form NEW={NEW} id={id} />
            </div>
        </div>
    )

    function close() {
        once(transitionEnd, ref.current, () => {
            toggleOverlay('manage-contact', false)
        });

        ref.current.classList.add("close");
    }
}


const Form = ({NEW, id}) => {

    return (
        <form action="/contacts" method="post" onSubmit={handleSubmit} className="mx-auto">
            {
                id && 
                <input name={id} type="text" hidden />
            }
            <div className="flex-col gap-3">
                <label className="nv-input fw br-5">
                    <div className="flex-col gap-1">
                        <small> Fullname* </small>
                        <input className="fw" name="names" placeholder="first middle last" required />
                    </div>
                </label>

                <label className="nv-input fw br-5">
                    <div className="flex-col gap-1">
                        <small> Handle* </small>
                        <label className="flex gap-1 mid-align">
                            <FontAwesomeIcon icon={faAt} />
                            <input className="fw" placeholder="valid MSG50 handle" name="handle" required />
                        </label>
                    </div>
                </label>
                
                <label className="nv-input fw br-5">
                    <div className="flex-col gap-1">
                        <small> Phone Number </small>
                        <input className="fw" placeholder="phone number" name="phone" type="tel" />
                    </div>
                </label>
                
                <div className="form-btns flex mid-align even-space">
                    { NEW?
                        <Button onClick={createContact}>
                            Add to Contacts
                        </Button>
                        :
                        <>
                        <IconBtn icon={faCheck} onClick={editContact} />
                        <IconBtn icon={faTrashCan} onClick={deleteContact} />
                        </>
                    }
                </div>
            </div>
        </form>
    )

    function handleSubmit(){}

    function createContact(){}

    function editContact(){}

    function deleteContact(){}
}