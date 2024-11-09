import './ui/media.css';

import { forwardRef, useContext, useEffect, useRef, useState } from "react";

import { View, ViewHead } from "./views";
import { IconBut } from "./buttons";
import { $, once, title, transitionEnd } from './ui/helpers';
import { ToggleOverlay } from './contexts';


const viewName = "Storage and Media";


export function Media({ open }) {
    const [view, setView] = useState();
    const viewObserver = initObserver();
    const mainRef = useRef(null), heighter = useRef(null), detailsRef = useRef(null), imgsRef = useRef(null), vidsRef = useRef(null), audsRef = useRef(null), othsRef = useRef(null);

    const toggleOverlay = useContext(ToggleOverlay);

    const mediaHeading =
        <ViewHead>
            <IconBut className="fa-solid fa-angle-left lg" onClick={close} />
            <div className="view-title grow gap-5 flex mid-align">
                <span> {viewName} </span>
                <i className="fa-solid fa-film"></i>
            </div>
        </ViewHead>;

    useEffect(() => {
        let t_id = open && setTimeout(() => {
            mainRef.current.classList.remove("close");
            adjustHeight();
        });

        return () => {
            t_id && clearTimeout(t_id);
        }
    }, [open]);

    return (
        open &&

        <View viewHead={mediaHeading} ref={mainRef}>
            <div className='max flex-col'>
                <div className="grow">
                    <div className='max' ref={heighter}>
                        <div className='flex max side-scroll hid-scroll' style={{display: "none"}}>

                            {/* if not active ...  show nothing
                            After activating, load resources,
                            20 secs after unactivated reload all */}

                            <Details ref={detailsRef} viewObserver={viewObserver} goTo={goTo} />
                            <ImagesList ref={imgsRef} viewObserver={viewObserver} />
                            <VideosList ref={vidsRef} viewObserver={viewObserver} />
                            <AudiosList ref={audsRef} viewObserver={viewObserver} />
                            <OthersList ref={othsRef} viewObserver={viewObserver} />
                        </div>
                    </div>
                </div>
                <MediaNav active={view} goTo={goTo} />
            </div>
        </View>
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

    function adjustHeight(){
        const el = heighter.current, h = el.clientHeight, child = $("q.side-scroll", el);
        child.style.height = `${h}px`;
        child.style.display = '';
    }

    function close() {
        const el = mainRef.current;
        once(transitionEnd, el, () => toggleOverlay('media', false));
        el.classList.add("close");
    }
}


const Details = forwardRef((props, ref) => {
    const { viewObserver, goTo } = props;

    useEffect(() => {
        viewObserver.observe(ref.current);

    }, [ref, viewObserver]);

    return (
        <div className="media-view max" data-section="details" ref={ref}>
            <div className='max custom-scroll pad' style={{ overflow: "hidden auto" }}>
                <div className="storage-brief">
                    <div className="fw">
                        <div className="fw flex" style={{alignItems: "baseline", color: "var(--tert-col)" }}>
                            <span style={{ fontSize: "50px"}}>
                                55
                            </span>
                            <small>GB</small>
                        </div>
                        <div className="fw">
                            <small> Out of </small> 100GB <small> Allocated Space </small>
                        </div>
                    </div>
                    <div className="fw">
                        CHART REPRESENTATION OF SPACE AVAILABLE
                    </div>
                </div>

                <hr></hr>

                <div>
                    {images.length ?
                        <div className="images-brief fw view-link" data-href="#img-slide">
                            <button className="flex mid-align fw no-btn pad vlh body-btn" onClick={() => goTo("images")}> 
                                <div className="vlt fw"> Photos </div>
                                <small className='flex mid-align gap-3'>
                                    <span>{  }</span>
                                    <i className="fa-solid fa-angle-right"></i>
                                </small>
                            </button>
                            <div className="vl-items-cont max gap-3">
                                { images.length > 5 &&
                                    <div className="view-all">
                                        <span className="abs-mid"> {`${images.length - 4}+`} </span>
                                    </div>
                                }
                                {images.map(img => <div key={img.id} className="vl-item"></div>)}
                            </div>
                        </div>
                        :
                        <></>
                    }

                    {videos.length ?
                        <div className="videos-brief fw view-link" data-href="#vid-slide">
                            <button className="flex mid-align fw no-btn pad vlh body-btn" onClick={() => goTo("videos")}> 
                                <div className="vlt fw"> Videos </div>
                                <small className='flex mid-align gap-3'>
                                    <span>{  }</span>
                                    <i className="fa-solid fa-angle-right"></i>
                                </small>
                            </button>
                            <div className="vl-items-cont max gap-3">
                                { videos.length > 5 &&
                                    <div className="view-all">
                                        <span className="abs-mid"> {`${videos.length - 4}+`} </span>
                                    </div>
                                }
                                {videos.map(vid => <div key={vid.id} className="vl-item"></div>)}
                            </div>
                        </div>
                        :
                        <></>
                    }

                    {audios.length ?
                        <div className="audios-brief fw view-link" data-href="#aud-slide">
                            <button className="flex mid-align fw no-btn pad vlh body-btn" onClick={() => goTo("audios")}> 
                                <div className="vlt fw"> Audios </div>
                                <small className='flex mid-align gap-3'>
                                    <span>{  }</span>
                                    <i className="fa-solid fa-angle-right"></i>
                                </small>
                            </button>
                            <div className="vl-items-cont max gap-3">
                                { audios.length > 5 &&
                                    <div className="view-all">
                                        <span className="abs-mid"> {`${audios.length - 4}+`} </span>
                                    </div>
                                }
                                {audios.map(aud => <div key={aud.id} className="vl-item"></div>)}
                            </div>
                        </div>
                        :
                        <></>
                    }

                    {others.length ?
                        <div className="others-brief fw view-link" data-href="#oth-slide">
                            <button className="flex mid-align fw no-btn pad vlh body-btn" onClick={() => goTo("others")}> 
                                <div className="vlt fw"> Others </div>
                                <small className='flex mid-align gap-3'>
                                    <span>{  }</span>
                                    <i className="fa-solid fa-angle-right"></i>
                                </small>
                            </button>
                            <div className="vl-items-cont max gap-3">
                                { others.length > 5 &&
                                    <div className="view-all">
                                        <span className="abs-mid"> {`${others.length - 4}+`} </span>
                                    </div>
                                }
                                {others.map(oth => <div key={oth.id} className="vl-item"></div>)}
                            </div>
                        </div>
                        :
                        <></>
                    }

                </div>
            </div>

        </div>
    )
})


const ImagesList = forwardRef((props, ref) => {
    const { preview, viewObserver } = props;

    useEffect(() => {
        viewObserver.observe(ref.current);

    }, [ref, viewObserver]);

    return (
        <div className="media-view max" data-section="images" ref={ref}>
            <div className='max custom-scroll' style={{ overflow: "hidden auto" }}>
                <div className='max flex even-space gap-2' style={{flexWrap: "wrap"}}>
                    {images.map(img => {
                        return (
                            <div key={img.id} className="media-grid-item br-5">{img.src}</div>
                        )
                    })}
                </div>
            </div>

        </div>
    )
})


const VideosList = forwardRef((props, ref) => {
    const { preview, viewObserver } = props;

    useEffect(() => {
        viewObserver.observe(ref.current);

    }, [ref, viewObserver]);


    return (
        <div className="media-view max" data-section="videos" ref={ref}>
            <div className='max custom-scroll' style={{ overflow: "hidden auto" }}>
                <div className='max flex even-space gap-2' style={{flexWrap: "wrap"}}>
                    {videos.map(vid => {
                        return (
                            <div key={vid.id} className="media-grid-item br-5">{vid.src}</div>
                        )
                    })}
                </div>
            </div>

        </div>
    )
})


const AudiosList = forwardRef((props, ref) => {
    const { preview, viewObserver } = props;

    useEffect(() => {
        viewObserver.observe(ref.current);
    }, [ref, viewObserver]);

    return (
        <div className="media-view max" data-section="audios" ref={ref}>
            <div className='max custom-scroll' style={{ overflow: "hidden auto" }}>
                <div className='max flex even-space gap-2' style={{flexWrap: "wrap"}}>
                    {audios.map(aud => {
                        return (
                            <div key={aud.id} className="media-grid-item br-5">{aud.src}</div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
})


const OthersList = forwardRef((props, ref) => {
    const { preview, viewObserver } = props;

    useEffect(() => {
        viewObserver.observe(ref.current);
    }, [ref, viewObserver]);

    return (
        <div className="media-view max" data-section="others" ref={ref}>
            <div className='max custom-scroll' style={{ overflow: "hidden auto" }}>
                <div className='fw'>
                    {
                        others.map(oth => {
                            const {fileSize, fileExt, name} = oth;

                            return (
                                <div key={oth.id} className="fw br-5" style={{backgroundColor: "var(--sec-col)"}}>
                                    <div className="fw flex mid-align gap-2" style={{padding: "5px"}}>
                                        <div>
                                            <i className="fa-solid fa-file fa-lg" aria-hidden="true"></i>
                                        </div>
                                        <div className="flex-col grow gap-1">
                                            <div className="crop-excess">
                                                {name}
                                            </div>
                                            <div className="fw">
                                                <small>
                                                    <span>{fileSize}</span>
                                                    <span>•</span>
                                                    <span>{fileExt}</span>
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </div>
    )
})


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


const images = [{ src: "img1", id: 1 }, { src: "img2", id: 2 }, { src: "img3", id: 3 }, { src: "img4", id: 4 }, { src: "img5", id: 5 }];
const videos = [{ src: "vid1", id: 1 }, { src: "vid2", id: 2 }, { src: "vid3", id: 3 }, { src: "vid4", id: 4 }, { src: "vid5", id: 5 }];
const audios = [{ src: "aud1", id: 1 }, { src: "aud2", id: 2 }, { src: "aud3", id: 3 }, { src: "aud4", id: 4 }, { src: "aud5", id: 5 }];
const others = [{ src: "doc1", name: "Doc1", id: 1 }, { src: "doc2", name: "Doc2", id: 2 }, { src: "doc3", name: "Doc3", id: 3 }, { src: "doc4", name: "Doc4", id: 4 }, { src: "doc5", name: "Doc5", id: 5 }];