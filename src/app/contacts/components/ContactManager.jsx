import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { StateNavigatorContext, ToggleOverlay } from "../../contexts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAt } from "@fortawesome/free-solid-svg-icons/faAt";
import { Button, IconBtn } from "../../../components/Button";
import { faCheck, faTrashCan, faXmark } from "@fortawesome/free-solid-svg-icons";
import { once, transitionEnd } from "../../../utils";
import { contactsTable, IDBPromise, loadDB, openTrans, saveContactToDB } from "../../../db";
import { Link } from "react-router-dom";
import { useContactName } from "../../components/Hooks";


export const ManageContact = ({ show, args }) => {
    const {NEW, id} = show ? args : {} ;
    const title = `${NEW? "Create" : "Edit"} Contact`;
    const [completed, setCompleted] = useState();

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

    useEffect(() => {
        if(completed && !completed.error)
            setTimeout( () => {
                handleCloseClick()
                window.location.reload()
            }, 500 );
    }, [completed])


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

                {
                    completed && (
                        completed.error?
                        <div className="p-2 br-5 center-text mx-auto" style={{backgroundColor: "pink", border: "1px solid salmon", color: "red"}}>
                            An error occured, could not perform action
                        </div>
                        :
                        <div className="p-2 br-5 center-text mx-auto" style={{backgroundColor: "limegreen", border: "1px solid green"}}>
                            {completed}
                        </div>
                    )
                }
                
                <Form NEW={NEW} id={id} showMessage={setCompleted} />
            </div>
        </div>
    )
    
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


const Form = ({NEW, id, showMessage}) => {
    const formRef = useRef();
    const name = NEW? '' : useContactName(id);
    // const {updateContact} = useContactUpdate(); 


    return (
        <form action="/contacts" method="post" onSubmit={handleSubmit} ref={formRef} className="mx-auto">
            {
                id && 
                <input name="id" value={id} type="text" hidden readOnly />
            }
            <div className="flex-col gap-3">
                <label className="nv-input fw br-5">
                    <div className="flex-col gap-1">
                        <small> Fullname* </small>
                        <input className="fw" name="name" placeholder="first middle last" defaultValue={name} required />
                    </div>
                </label>

                <label className="nv-input fw br-5">
                    <div className="flex-col gap-1">
                        <small> Handle* </small>
                        <label className="flex gap-1 mid-align">
                            <FontAwesomeIcon icon={faAt} />
                            <input className="fw" placeholder="valid MSG50 handle" name="handle" defaultValue={id ?? ''} contentEditable={!NEW} required />
                        </label>
                    </div>
                </label>
                
                <label className="nv-input fw br-5">
                    <div className="flex-col gap-1">
                        <small> Phone Number (optional) </small>
                        <input className="fw" placeholder="phone number" name="phone" type="tel" />
                    </div>
                    <small> This information is not shared. Read our <Link className="no-link" to="/privacy.pdf"> privacy policy </Link>  </small>
                </label>
                
                <div className="form-btns flex mid-align even-space">
                    { NEW?
                        <Button type="submit">
                            Add to Contacts
                        </Button>
                        :
                        <>
                        <Button onClick={editContact}>
                            <span> Save Edit </span>
                            <FontAwesomeIcon icon={faCheck} />
                        </Button>

                        <Button onClick={deleteContact}>
                            <span> Delete Contact </span>
                            <FontAwesomeIcon icon={faTrashCan} />
                        </Button>
                        </>
                    }
                </div>
            </div>
        </form>
    )

    function handleSubmit(e){
        e.preventDefault();
        if (NEW){
            const form = e.target;
            const name = form["name"].value, handle = form["handle"].value, phone = form["phone"].value
            saveContactToDB({name, handle, phone})
            .then(_ => {
                showMessage("Successfully Created Contact");
                // updateContact({id: handle, name, handle, phone});
            })
            .catch( _ => showMessage({error: true}))
        }
    }

    function editContact(){
        const form = formRef.current;
        const name = form["name"].value, handle = form["handle"].value, phone = form["phone"].value
        saveContactToDB({name, handle, phone})
        .then(_ =>{ 
            showMessage("Successfully Edited Contact") 
            // updateContact({id: handle, name, handle, phone});
        })
        .catch( _ => showMessage({error: true}))
    }

    function deleteContact(){
        loadDB()
        .then( DB => {
            IDBPromise( openTrans(DB, contactsTable, 'readwrite').delete(id) )
        })
        .then(_ => {
            showMessage("Successfully Deleted Contact") 
            // updateContact({id: handle}, true);
        })
        .catch( _ => showMessage({error: true}))
    }
}