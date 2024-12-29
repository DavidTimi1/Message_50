import './page.css';

import { useEffect, useRef, useState } from "react";

import { RouteContainer } from "../components/View";
import { $, title } from '../../utils';

import { Details } from './components/Details';
import { ImagesList } from './components/Images';
import { VideosList } from './components/Videos';
import { AudiosList } from './components/Audios';
import { OthersList } from './components/Files';
import { Heading } from './components/Heading';
import { useNavigate } from 'react-router-dom';
import { filesTable, loadDB, openTrans } from '../../db';


const viewName = "Storage and Media";


export const MediaPage = () => {

    const [view, setView] = useState();
    const viewObserver = initObserver();
    const mainRef = useRef(null), heighter = useRef(null), detailsRef = useRef(null), imgsRef = useRef(null), vidsRef = useRef(null), audsRef = useRef(null), othsRef = useRef(null);

    const [files, setFiles] = useState({})

    const navigate = useNavigate();

    useEffect(() => {
        let t_id = setTimeout(() => {
            mainRef.current.classList.remove("close");
            adjustHeight();
        });


        loadFiles()
        .then(setFiles);

        return () => {
            t_id && clearTimeout(t_id);
        }
    }, []);


    return (
        <RouteContainer id="media" heading={<Heading close={close} />} ref={mainRef}>
            
            <div className='max flex-col'>
                <div className="grow">
                    <div className='max' ref={heighter}>
                        <div className='flex max side-scroll hid-scroll' style={{ display: "none" }}>

                            {/* if not active ...  show nothing
                            After activating, load resources,
                            20 secs after unactivated reload all */}

                            <Details ref={detailsRef} viewObserver={viewObserver} data={files} goTo={goTo} />
                            <ImagesList ref={imgsRef} viewObserver={viewObserver} data={files.images} />
                            <VideosList ref={vidsRef} viewObserver={viewObserver} data={files.videos} />
                            <AudiosList ref={audsRef} viewObserver={viewObserver} data={files.audios} />
                            <OthersList ref={othsRef} viewObserver={viewObserver} data={files.others} />
                        </div>
                    </div>
                </div>
                <MediaNav active={view} goTo={goTo} />
            </div>
        </RouteContainer>
    )

    function goTo(name) {
        let ref;
        switch (name) {
            case 'details': {
                ref = detailsRef;
                break;
            }
            case 'images': {
                ref = imgsRef;
                break;
            }
            case 'videos': {
                ref = vidsRef;
                break;
            }
            case 'audios': {
                ref = audsRef;
                break;
            }
            case 'others': {
                ref = othsRef;
                break;
            }
            default: {
                console.error("No match found for:", name)
            }
        }
        ref && ref.current.scrollIntoView({ behaviour: "smooth", inline: "start" });
    }

    function initObserver() {
        // Define a callback function that will be called when the target element's visibility changes
        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                const { target, isIntersecting } = entry;

                if (isIntersecting) {
                    setView(target.dataset.section);
                }
            });
        };

        // Create a new IntersectionObserver instance and pass the callback function
        const observer = new IntersectionObserver(observerCallback, {
            root: null, // Use the viewport as the root
            rootMargin: '0px', // Margin around the root
            threshold: 0.8 // 80% of the element's visibility triggers the callback
        });
        return observer
    }

    function adjustHeight() {
        const el = heighter.current, h = el.clientHeight, child = $("q.side-scroll", el);
        child.style.height = `${h}px`;
        child.style.display = '';
    }

    function close() {
        const el = mainRef.current;
        el.classList.add("close");
        setTimeout(() => navigate('/app'), 200);        
    }
}






function MediaNav({ active, goTo }) {
    return (
        <nav className="media-nav fw">
            <div className="fw flex mid-align even-space">
                <NavItem name="details" />
                <NavItem name="images" />
                <NavItem name="videos" />
                <NavItem name="audios" />
                <NavItem name="others" />
            </div>
        </nav>
    )

    function showFiles(href) {
        // const {target: {dataset: {href}}} = e;
        goTo(href)
    }

    function NavItem({ name }) {
        const isActive = active === name;

        return (
            <button className={"no-btn" + (isActive ? " active" : '')} type="button" onClick={() => showFiles(name)}>
                {title(name)}
            </button>
        )
    }
}



async function getFilesByType(type, limit = 50) {

    return loadDB()
    .then( DB => 
        new Promise((resolve, reject) => {

            const store = openTrans(DB, filesTable);
            const index = store.index("type");
            
            const results = [];

            const request = index.openCursor(type);
            request.onsuccess = (e) => {
                const cursor = e.target.result;

                if (cursor && results.length < limit) {
                    results.push(cursor.value);
                    cursor.continue();

                } else {
                    resolve(results);
                }
            };

            request.onerror = (e) => {
                reject(e.target.error);
            };
        })
    )
}


async function loadFiles() {
    return new Promise( async (resolve, reject) => {

        try {
            const [images, videos, audio, other] = await Promise.all([
                getFilesByType("image"),
                getFilesByType("video"),
                getFilesByType("audio"),
                getFilesByType("other"),
            ]);

            resolve({ images, videos, audio, other });
        } catch (error) {
            reject(error);
        }
    })

}