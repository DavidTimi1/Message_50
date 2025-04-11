import { createContext, useContext, useEffect, useRef, useState } from "react";
import { DevMode } from "../../../App";
import { ChatContext, ToggleOverlay } from "../../contexts";
import { ContactItem } from "./ContactItem";
import { $ } from "../../../utils";
import { contactsTable, loadDB, openTrans } from "../../../db";


export const ContactUpdateContext = createContext(null);

export const ContactList = () => {
    const [contacts, setContacts] = useState({});
    const ref = useRef(null);

    const hashes = Object.keys(contacts).sort( (a, b) => a > b ? 1 : a == b ? 0 : -1 );

    const toggleMessaging = useContext(ChatContext).set;
    const toggleOverlay = useContext(ToggleOverlay);

    useEffect(() => {
        getContacts()
        .then(setContacts)

    }, [])


    return (
        <ContactUpdateContext.Provider value={{update: updateContact}}>
            <div className="contact-list custom-scroll max">
                <div className='content' 
                    ref={ref} 
                    onClick={handleClick} 
                    onContextMenu={handleContextMenu}
                >
                    { hashes.length? 

                        hashes.map( hash => {
                            const hashBucket = contacts[hash];

                            return hashBucket.sort( sortByName )
                            .map( person =>{
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
        </ContactUpdateContext.Provider>
    )


    function handleClick(e){
        const {target} = e;

        const el = target.closest(".contact-cont"), clickedMenu = target.closest(".contact-cont .dropdown");

        if (!el) return;

        if (clickedMenu){
            // menu was clicked
        } else {
            toggleOverlay('user-card', {id: el.dataset.id});
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

    function updateContact(contact, isDeleted=false){
        let {id, name} = contact;
        name = name ?? "~" + id;
                
        let hash = name.charAt(0).toUpperCase();
        hash = hash.toLowerCase() == hash ? '#' : hash

        if (id === 'multiple') return;

        setContacts(prev => {
            const contacts = {...prev};

            if (hash in contacts){
                const hashBucket = contacts[hash];
                const index = hashBucket.findIndex( c => c.handle === id );

                if (index > -1){
                    if (isDeleted){
                        hashBucket.splice(index, 1);

                        if (hashBucket.length === 0)
                            delete contacts[hash];

                    } else {
                        hashBucket[index] = contact;
                    }
                } else
                    hashBucket.unshift(contact);

            } else {
                contacts[hash] = [contact];
            }
        })
    }
}



function getContacts(){
    const contactsHashTable = {};
    

    return loadDB()
    .then( DB => new Promise((res, rej) => {

        let req = openTrans(DB, contactsTable).openCursor();

        req.onsuccess = (e) => {
            let cursor = e.target.result;

            if (cursor) {

                const {handle, name} = cursor.value, id = handle, detail = { id, handle, name: name ?? "~" + handle }
                
                let char = (detail.name).charAt(0).toUpperCase();
                char = char.toLowerCase() == char ? '#' : char

                if (!(char in contactsHashTable))
                    contactsHashTable[char] = []

                contactsHashTable[char].push(detail);
                contactsHashTable[char].sort( sortByName );

                cursor.continue();

            } else
                res(contactsHashTable);
        }

        req.onerror = (e) => rej(e.target.error)
    }))
}


function sortByName(a, b){
    return ( a.name > b.name ? 1 : a.name == b.name ? 0 : -1 )
}