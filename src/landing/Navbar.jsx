import '../components/Navbar.css';

import { useEffect, useState, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';

import { once, transitionEnd } from '../utils';

import { faAngleRight, faBars, faDownload, faXmark } from '@fortawesome/free-solid-svg-icons';
import { githubLink, ProdName } from '../App';
import { Button, IconBtn } from '../components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { installPWA, usePWAContext } from '../lib/pwa';



export default function Navbar({scroll}){
    const [showMenu, setShow] = useState(false);
    const { isInstalled, installPrompt } = usePWAContext();
    const isInstallable = Boolean(installPrompt) || isInstalled;


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

                    <div className='flex gap-2 mid-align even-space'>
                        <Link to={githubLink} className="no-link" target="_blank" rel="noopener noreferrer">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                width="24"
                                height="24"
                                fill="white"
                                aria-label="GitHub"
                            >
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.234c-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.744.083-.729.083-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.835 2.807 1.305 3.492.997.108-.774.418-1.305.762-1.605-2.665-.305-5.467-1.332-5.467-5.93 0-1.31.468-2.38 1.235-3.22-.123-.303-.535-1.523.117-3.176 0 0 1.007-.322 3.3 1.23a11.52 11.52 0 0 1 3.003-.403c1.02.005 2.045.137 3.003.403 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.241 2.873.118 3.176.77.84 1.233 1.91 1.233 3.22 0 4.61-2.807 5.624-5.48 5.92.43.37.823 1.102.823 2.222v3.293c0 .32.218.694.825.576C20.565 21.796 24 17.297 24 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                            <span className="sr-only">Link to github repo</span>
                        </Link>

                        {
                            isInstalled || isInstallable ?
                            <>
                                <Link to="/app" className="my-btn no-link deval br-5X">
                                    <div className="btn-bg">
                                        <div className="btn d-flex mid-align gap-2">
                                            <span> Use Web </span>
                                            <FontAwesomeIcon icon={faAngleRight} />
                                        </div>
                                    </div>
                                </Link>
                                <Button onClick={() => installPWA(installPrompt)}>
                                    <FontAwesomeIcon icon={faDownload} />
                                    <span> {isInstalled? "Use" : "Install"} App </span>
                                </Button>
                            </>
                            :
                            <Link to="/app" className="my-btn no-link br-5">
                                <div className="btn-bg">
                                    <div className="btn max">
                                        <span> Get Started </span>
                                        <FontAwesomeIcon icon={faAngleRight} />
                                    </div>
                                </div>
                            </Link>
                        }
                    </div>
                </nav>

                <div className="mobile-nav nav fw flex mid-align">
                    <div className="flex mid-align gap-1">
                        <h2 className="brand fh fs-3"> {ProdName} </h2>
                    </div>

                    <div className='mid-align' style={{"--col": "var(--foreground)"}}>
                        <Link to={githubLink} className="no-link" target="_blank" rel="noopener noreferrer">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                width="24"
                                height="24"
                                aria-label="GitHub"
                                fill="white"
                            >
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.234c-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.744.083-.729.083-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.835 2.807 1.305 3.492.997.108-.774.418-1.305.762-1.605-2.665-.305-5.467-1.332-5.467-5.93 0-1.31.468-2.38 1.235-3.22-.123-.303-.535-1.523.117-3.176 0 0 1.007-.322 3.3 1.23a11.52 11.52 0 0 1 3.003-.403c1.02.005 2.045.137 3.003.403 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.241 2.873.118 3.176.77.84 1.233 1.91 1.233 3.22 0 4.61-2.807 5.624-5.48 5.92.43.37.823 1.102.823 2.222v3.293c0 .32.218.694.825.576C20.565 21.796 24 17.297 24 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                            <span className="sr-only">
                                Link to github repo
                            </span>
                        </Link>

                        { showMenu ? 
                            <IconBtn icon={faXmark} hover="Close" onClick={()=> toggleMenu(false)} sr="close menu"/>
                            :
                            <IconBtn icon={faBars} hover="Menu" onClick={()=> toggleMenu(true)} sr="open menu"/>
                        }
                    </div>
                </div>

                <Menu show={showMenu}  closeMenu={()=> toggleMenu(false)} />
            </section>
        </div>
    )
    
    function toggleMenu(bool){
        setShow(bool);
    }

}



function Menu({show, closeMenu}){
    const myRef = useRef(null);
    const { isInstalled, installPrompt } = usePWAContext();
    const isInstallable = Boolean(installPrompt) || isInstalled;

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
                    <div className="d-flex flex-col gap-2 pad">
                        <div className="w-full">
                            <hr />
                        </div>

                        {
                            isInstalled || isInstallable ?
                            <>
                                <Button onClick={() => installPWA(installPrompt)}>
                                    <FontAwesomeIcon icon={faDownload} />
                                    <span> {isInstalled? "Use" : "Install"} App </span>
                                </Button>

                                <Link to="/app" className="my-btn no-link deval br-5">
                                    <div className="btn-bg">
                                        <div className="btn max">
                                            <span> Continue on the web </span>
                                            <FontAwesomeIcon icon={faAngleRight} />
                                        </div>
                                    </div>
                                </Link>
                            </>
                            :
                            <>
                            <Link to="/app" className="my-btn no-link br-5">
                                <div className="btn-bg">
                                    <div className="btn max">
                                        <span> Get Started </span>
                                        <FontAwesomeIcon icon={faAngleRight} />
                                    </div>
                                </div>
                            </Link>

                            { !isInstallable &&
                                <small className='mx-auto fw-light text-italic' style={{color: "var(--text2-col)"}}>
                                    Your device currently doesn't support installation of this WebApp. <br /> To do this visit options menu and click "Add to Home Screen"
                                </small>
                            }
                            </>
                        }


                    </div>

                </nav>
            </div>
        </div>
    )

    function close(){
        once(transitionEnd, myRef.current, closeMenu);
        myRef.current.classList.add("close");
    }
}