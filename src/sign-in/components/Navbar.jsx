import '../../components/Navbar.css';

import { useEffect, useState, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';

import { transitionEnd } from '../../utils';

import { faBars, faXmark } from '@fortawesome/free-solid-svg-icons';
import { ProdName } from '../../App';
import { IconBtn } from '../../components/Button';



export default function Navbar({scroll}){
    const [showMenu, setShow] = useState(false);


    return (
        <div className={"navbar fw" + (scroll? " scroll" : "") }>
            <div className='fw pad'>
                <div className="lap-nav nav fw flex mid-align" style={{justifyContent: "space-between"}}>
                    <a href="/" className="no-link flex-rev mid-align gap-1 brand">
                        <h3 className="brand fh"> {ProdName} </h3>
                    </a>

                    <div className="menu flex mid-align">
                        <Link className="nav-item" to='/#features'>
                            Features
                        </Link>
                        <Link className="nav-item" to='/#faqs'>
                            FAQS
                        </Link>
                        <Link className="nav-item" to='/#contact-us'>
                            Contact Us
                        </Link>
                    </div>

                    <div>
                    </div>
                </div>

                <div className="mobile-nav nav fw flex mid-align">
                    <div className="flex mid-align gap-1">
                        <h3 className="brand fh"> {ProdName} </h3>
                    </div>

                    <div style={{"--col": "var(--foreground)"}}>
                        { showMenu ? 
                            <IconBtn icon={faXmark} hover="Close" onClick={()=> toggleMenu(false)} sr="close menu"/>
                            :
                            <IconBtn icon={faBars} hover="Menu" onClick={()=> toggleMenu(true)} sr="open menu"/>
                        }
                    </div>
                </div>

                <Menu show={showMenu} closeMenu={()=> toggleMenu(false)} />
            </div>
        </div>
    )
    
    function toggleMenu(bool){
        setShow(bool);
    }

}


function Menu({show, closeMenu}){
    const myRef = useRef(null);

    useEffect(() => {
        let t_id = show && setTimeout(() => myRef.current.classList.remove("close"));

        return ()=> {
            t_id && clearTimeout(t_id);
        }
    }, [show])

    return (
        show &&
        <div className="menu mob abs close" onClick={close} ref={myRef}>
            <div className='wrapper max'>
                <div className="content fw flex-col">
                    <NavLink className="nav-item" to='/' end={true}>
                        Home
                    </NavLink>
                    <Link className="nav-item" to='/#features'>
                        Features
                    </Link>
                    <Link className="nav-item" to='/#faqs'>
                        FAQS
                    </Link>
                    <Link className="nav-item" to='/#contact-us'>
                        Contact Us
                    </Link>
                    <Link className="nav-item" to='/app'>
                        App
                    </Link>
                </div>
            </div>
        </div>
    )

    function close(){
        once(transitionEnd, myRef.current, closeMenu);
        myRef.current.classList.add("close");
    }
}