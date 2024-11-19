import { useContext, useRef, useState } from "react";
import { DevMode } from "../../../App";
import { ChatContext, ToggleOverlay } from "../../contexts";
import { ContactItem } from "./ContactItem";
import { $ } from "../../../utils";




export const ContactList = () => {
    const [contacts, setContacts] = useState(DevMode? devContacts : []);
    const ref = useRef(null);

    const toggleMessaging = useContext(ChatContext).set;
    const toggleOverlay = useContext(ToggleOverlay)


    return (
        <div className="contact-list custom-scroll max">
            <div className='content' 
                ref={ref} 
                onClick={handleClick} 
                onContextMenu={handleContextMenu}
            >
                { contacts.length? 
                
                    contacts.map( person =>{
                        const {handle} = person;

                        if (handle === 'multiple') return;

                        return (
                            <ContactItem
                                key={handle}
                                Message={toggleMessaging}
                                data={person}
                            /> 
                        )
                    })
                    : 
                    <>
                        <div className="no-message"> You do not have any contacts. </div>
                        <div className="new-ptr">
                            Click the add contact icon to create a new contact.
                        </div>
                    </>

                }
            </div>
        </div>
    )


    function handleClick(e){
        const {target} = e;

        const el = target.closest(".contact-cont"), clickedMenu = target.closest(".contact-cont .dropdown");

        if (clickedMenu){
            // menu was clicked
        } else {
            toggleOverlay('user-card', true);
        }
    }

    function handleContextMenu(e){
        const {target} = e;
        e.preventDefault();

        const el = target.closest(".contact-cont"), dropdown = el && $('q.icon-btn', el);

        if (dropdown){
            dropdown.click();           
        }
    }
}


const devContacts = [
    {
        id: 3,
        name: "Jacob",
        handle: "@Jayjay",
    },
    {
        id: 7,
        name: "John",
        handle: "@J_ohn",
    },
    {
        id: 30,
        name: "John, Peace",
        handle: "multiple",
    },
]