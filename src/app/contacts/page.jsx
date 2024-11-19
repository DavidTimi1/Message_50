import './page.css';

import { useEffect, useRef } from "react";

import { RouteContainer } from "../components/View";
import { $, title } from '../../utils';

import { useNavigate } from 'react-router-dom';

import { Heading } from "./components/Heading";
import { SideShelf } from './components/SideShelf';
import { ContactList } from './components/ContactList';

const viewName = "Contacts";



export const ContactsPage = () => {
    const mainRef = useRef(null), heighter = useRef(null);

    const navigate = useNavigate();

    useEffect(() => {
        let t_id = setTimeout(() => mainRef.current.classList.remove("close"));
        // adjustHeight();

        return () => {
            t_id && clearTimeout(t_id);
        }
    }, [])


    return (
        <RouteContainer id="contacts" heading={<Heading close={close} />} ref={mainRef}>
            <ContactList />

            <SideShelf />
        </RouteContainer>
    )

    function adjustHeight() {
        const el = heighter.current, h = el.clientHeight, child = $("q.list", el);
        child.style.height = `${h}px`;
        child.style.display = '';
    }

    function close() {
        const el = mainRef.current;
        el.classList.add("close");
        setTimeout(() => navigate('/app'), 200);        
    }
}
