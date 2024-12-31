import { useCallback, useContext, useEffect, useRef } from "react";
import { StateNavigatorContext, ToggleOverlay } from "../../contexts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAt } from "@fortawesome/free-solid-svg-icons/faAt";
import { Button, IconBtn } from "../../../components/Button";
import { faCheck, faTrashCan, faXmark } from "@fortawesome/free-solid-svg-icons";
import { once, transitionEnd } from "../../../utils";



export const ManageContact = ({ show, args }) => {
    const {NEW, id} = show ? args : {} ;
    const title = `${NEW? "Create" : "Edit"} Contact`;

    const ref = useRef(null), navId = 'manage-contact';
    const toggleOverlay = useContext(ToggleOverlay);

    const { pushState, removeState } = useContext( StateNavigatorContext );

    // Close function with animation handling
    const close = useCallback(() => {
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
    }, [toggleOverlay, navId]);


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
        <div className="interface close manage-contact" ref={ref}>
            <div className="max custom-scroll" style={{overflow: "hidden auto"}}>
                <div className="fw flex mid-align gap-2" style={{padding: "10px"}}>
                    <IconBtn icon={faXmark} onClick={handleCloseClick}>
                        <span className="sr-only"> Close </span>
                    </IconBtn>
                    <h3> {title} </h3>
                </div>
                
                <Form NEW={NEW} id={id} />
            </div>
        </div>
    )

    // function close() {
    //     once(transitionEnd, ref.current, () => {
    //         toggleOverlay('manage-contact', false)
    //     });

    //     ref.current.classList.add("close");
    // }
    
    function handleCloseClick(){
        // go back in history to trigger close
        return new Promise( res => {
            once(transitionEnd, ref.current, () =>{
                let done = removeState(navId);
            });

            ref.current.classList.add("close");
        })        
    }
}


const Form = ({NEW, id}) => {

    return (
        <form action="/contacts" method="post" onSubmit={handleSubmit} className="mx-auto">
            {
                id && 
                <input name="id" value={id} type="text" hidden readOnly />
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