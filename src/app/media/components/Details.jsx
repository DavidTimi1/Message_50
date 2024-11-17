
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { forwardRef, useEffect } from "react";



export const Details = forwardRef((props, ref) => {
    const { viewObserver, goTo } = props;

    useEffect(() => {
        viewObserver.observe(ref.current);

    }, [ref, viewObserver]);

    
    return (
        <div className="media-view max" data-section="details" ref={ref}>
            <div className='max custom-scroll pad' style={{ overflow: "hidden auto" }}>
                <div className="storage-brief">
                    <div className="fw">
                        <div className="fw flex" style={{ alignItems: "baseline", color: "var(--btn-col)" }}>
                            <span style={{ fontSize: "50px" }}>
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
                    {
                        images.length ?
                            <div className="images-brief fw view-link" data-href="#img-slide">
                                <button className="flex mid-align fw no-btn pad vlh body-btn" onClick={() => goTo("images")}>
                                    <div className="vlt fw"> Photos </div>
                                    <small className='flex mid-align gap-2'>
                                        <span>{ }</span>
                                        <FontAwesomeIcon icon={faAngleRight} />
                                    </small>
                                </button>
                                <div className="vl-items-cont max gap-2">
                                    { 
                                        images.map(img => <div key={img.id} className="vl-item br-5"></div>)
                                    }
                                    { 
                                        images.length > 4 &&
                                        <div className="view-all">
                                            <span className="abs-mid"> {`${images.length - 3}+`} </span>
                                        </div>
                                    }
                                </div>
                            </div>
                        :
                            <></>
                    }

                    {
                        videos.length ?

                            <div className="videos-brief fw view-link" data-href="#vid-slide">
                                <button className="flex mid-align fw no-btn pad vlh body-btn" onClick={() => goTo("videos")}>
                                    <div className="vlt fw"> Videos </div>
                                    <small className='flex mid-align gap-3'>
                                        <span>{ }</span>
                                        <FontAwesomeIcon icon={faAngleRight} />
                                    </small>
                                </button>
                                <div className="vl-items-cont max gap-2">
                                    {videos.map(vid => <div key={vid.id} className="vl-item br-5"></div>)}

                                    {videos.length > 4 &&
                                        <div className="view-all">
                                            <span className="abs-mid"> {`${videos.length - 3}+`} </span>
                                        </div>
                                    }
                                </div>
                            </div>
                        :
                            <></>
                    }

                    {
                        audios.length ?
                            <div className="audios-brief fw view-link" data-href="#aud-slide">
                                <button className="flex mid-align fw no-btn pad vlh body-btn" onClick={() => goTo("audios")}>
                                    <div className="vlt fw"> Audios </div>
                                    <small className='flex mid-align gap-3'>
                                        <span>{ }</span>
                                        <FontAwesomeIcon icon={faAngleRight} />
                                    </small>
                                </button>
                                <div className="vl-items-cont max gap-2">
                                    {audios.map(aud => <div key={aud.id} className="vl-item br-5"></div>)}

                                    {audios.length > 4 &&
                                        <div className="view-all">
                                            <span className="abs-mid"> {`${audios.length - 3}+`} </span>
                                        </div>
                                    }
                                </div>
                            </div>
                        :
                            <></>
                    }

                    {
                        others.length ?
                            <div className="others-brief fw view-link" data-href="#oth-slide">
                                <button className="flex mid-align fw no-btn pad vlh body-btn" onClick={() => goTo("others")}>
                                    <div className="vlt fw"> Others </div>
                                    <small className='flex mid-align gap-3'>
                                        <span>{ }</span>
                                        <FontAwesomeIcon icon={faAngleRight} />
                                    </small>
                                </button>
                                <div className="vl-items-cont max gap-2">
                                    {others.map(oth => <div key={oth.id} className="vl-item br-5"></div>)}

                                    {others.length > 4 &&
                                        <div className="view-all">
                                            <span className="abs-mid"> {`${others.length - 3}+`} </span>
                                        </div>
                                    }
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


const images = [{ src: "img1", id: 1 }, { src: "img2", id: 2 }, { src: "img3", id: 3 }, { src: "img4", id: 4 }, { src: "img5", id: 5 }];
const videos = [{ src: "vid1", id: 1 }, { src: "vid2", id: 2 }, { src: "vid3", id: 3 }, { src: "vid4", id: 4 }, { src: "vid5", id: 5 }];
const audios = [{ src: "aud1", id: 1 }, { src: "aud2", id: 2 }, { src: "aud3", id: 3 }, { src: "aud4", id: 4 }, { src: "aud5", id: 5 }];
const others = [{ src: "doc1", name: "Doc1", id: 1 }, { src: "doc2", name: "Doc2", id: 2 }, { src: "doc3", name: "Doc3", id: 3 }, { src: "doc4", name: "Doc4", id: 4 }, { src: "doc5", name: "Doc5", id: 5 }];