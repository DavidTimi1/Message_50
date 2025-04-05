import './page.css';

import { useContext, useEffect, useRef, useState } from "react";

import { RouteContainer } from "../components/View";
import { $, title } from '../../utils';

import { Details } from './components/Details';
import { ImagesList } from './components/Images';
import { VideosList } from './components/Videos';
import { AudiosList } from './components/Audios';
import { OthersList } from './components/Files';
import { Heading } from './components/Heading';
import { useNavigate } from 'react-router-dom';
import { filesTable, getFile, loadDB, openTrans } from '../../db';
import { faFile, faImage, faMicrophone, faPlay, faVideo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ToggleOverlay } from '../contexts';


const placeholderImg = '/placeholder-img.jpg';
const placeholderVid = '/placeholder-vid.jpg';
const viewName = "Storage and Media";
export const ALLOWED_MEDIA_TYPES = ["image", "video", "audio", "other"]


export const MediaPage = () => {

    const [view, setView] = useState();
    const viewObserver = initObserver();
    const mainRef = useRef(null), detailsRef = useRef(null), imgsRef = useRef(null), vidsRef = useRef(null), audsRef = useRef(null), othsRef = useRef(null);

    const [files, setFiles] = useState({})

    const navigate = useNavigate();

    useEffect(() => {
        let t_id = setTimeout(() => {
            mainRef.current.classList.remove("close");
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
                <div className="grow" style={{overflow: "hidden"}}>
                        <div className='flex max side-scroll hid-scroll'>

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

    function close() {
        const el = mainRef.current;
        el.classList.add("close");
        setTimeout(() => navigate('/app'), 200);        
    }
}



export function TextualFile({fileInfo, hasText}){
    if (!fileInfo) return <></>

    const fileType = fileInfo.metadata.type;
    let JSXFrag;

    switch(fileType){
        case "image": JSXFrag = <small> <FontAwesomeIcon icon={faImage} size="sm" /> {hasText? '': "Photo"} </small>
        break;
        
        case "video": JSXFrag = <small> <FontAwesomeIcon icon={faVideo} size="sm" /> {hasText? '': "Video"} </small>
        break;
        
        case "audio": JSXFrag = <small> <FontAwesomeIcon icon={faMicrophone} size="sm" /> {hasText? '': "Audio"} </small>
        break;
        
        default: JSXFrag = <small> <FontAwesomeIcon icon={faFile} size="sm" /> {hasText? '': "File"} </small>
        break;
    }

    return JSXFrag

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


async function getFilesByType(type, limit = 20) {

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
                    const fileData = cursor.value.data;
                    const data = cursor.value.thmb ?? {} ;
                    data.id = cursor.primaryKey;
                    data.ext = fileData?.name?.split('.')?.slice(-1)?.[0] ?? "txt";

                    if (type === 'other') {
                        data.name = fileData?.name ?? "File";
                        data.size = fileData?.size ?? "...KB";
                    }
                    results.push(data);
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
            const [images, videos, audios, others] = await Promise.all([
                getFilesByType("image"),
                getFilesByType("video"),
                getFilesByType("audio"),
                getFilesByType("other"),
            ]);

            resolve({ images, videos, audios, others });
        } catch (error) {
            reject(error);
        }
    })

}

export const ImgThmb = ({data}) => {
    const thmbSrc = URL.createObjectURL(data);
    const toggleOverlay = useContext(ToggleOverlay);

    return (
        <div className="img-thmb max" onClick={handleClick}>
            <img src={thmbSrc || placeholderImg} alt='' style={{objectFit: "cover"}} />
        </div>
    )

    async function handleClick(){
        const fileInfo = await getFile(data.id), fileData = fileInfo.data, type = fileInfo.type;
        const src = URL.createObjectURL(fileData);

        toggleOverlay('media-viewer', {src, type})
    }
}

export const VidThmb = ({data}) => {
    const thmbSrc = URL.createObjectURL(data);
    const toggleOverlay = useContext(ToggleOverlay);

    return (
        <div className="vid-thmb max" onClick={handleClick}>
            <img src={thmbSrc || placeholderVid} alt='' style={{objectFit: "cover"}} />
            <div className='abs-mid'>
                <FontAwesomeIcon icon={faPlay} />
            </div>
        </div>
    )

    async function handleClick(){
        const fileInfo = await getFile(data.id), fileData = fileInfo.data, type = fileInfo.type;
        const src = URL.createObjectURL(fileData);

        toggleOverlay('media-viewer', {src, type})
    }
}

export const AudThmb = ({data}) => {
    const toggleOverlay = useContext(ToggleOverlay);

    return (
        <div className="file-thmb max" onClick={handleClick}>
            <div className='abs-mid flex-col mid-align gap-2'>
                <FontAwesomeIcon icon={ faMicrophone } size="lg" />
                <span className='text-sm'>{data.ext}</span>
            </div>
        </div>
    )

    async function handleClick(){
        const fileInfo = await getFile(data.id), fileData = fileInfo.data, type = fileInfo.type;
        const src = URL.createObjectURL(fileData);

        toggleOverlay('media-viewer', {src, type})
    }
}

export const FileThmb = ({data}) => {
    return (
        <div className="fw flex mid-align gap-2" style={{ padding: "5px" }} onClick={handleClick}>
            <div>
                <FontAwesomeIcon icon={faFile} size="xl" />
            </div>
            <div className="flex-col grow gap-1">
                <div className="crop-excess">
                    {data.name}
                </div>
                <div className="fw">
                    <small>
                        <span>{data.size}</span>
                        <span>•</span>
                        <span>{data.ext}</span>
                    </small>
                </div>
            </div>
        </div>
    )

    async function handleClick(){
        const fileData = await getFile(data.id).data;
        const src = URL.createObjectURL(fileData);
        // auto click download link
        const a = document.createElement('a');
        a.href = src;
        a.download = data.name;
        a.click();
    }
}