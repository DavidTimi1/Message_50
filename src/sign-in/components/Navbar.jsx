import '../../components/Navbar.css';

import { useEffect, useState, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';

import { once, transitionEnd } from '../../utils';

import { faBars, faXmark } from '@fortawesome/free-solid-svg-icons';
import { ProdName } from '../../App';
import { IconBtn } from '../../components/Button';



export default function Navbar({scroll}){
    const [showMenu, setShow] = useState(false);


    return (
        <div className={"navbar fw" + (scroll? " scroll" : "") }>
            <section className='fw pad'>
                <nav className="lap-nav nav fw flex mid-align" style={{justifyContent: "space-between"}}>
                    <a href="/" className="no-link flex-rev mid-align gap-1 brand">
                        <h2 className="brand fh fs-3"> {ProdName} </h2>
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
                </nav>

                <div className="mobile-nav nav fw flex mid-align">
                    <div className="flex mid-align gap-1">
                        <h2 className="brand fh fs-3"> {ProdName} </h2>
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
            </section>
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
                <nav className="content fw flex-col">
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
                </nav>
            </div>
        </div>
    )

    function close(){
        once(transitionEnd, myRef.current, closeMenu);
        myRef.current.classList.add("close");
    }
}