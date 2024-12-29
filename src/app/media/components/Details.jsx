
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { forwardRef, useEffect } from "react";



export const Details = forwardRef((props, ref) => {
    const { data, viewObserver, goTo } = props;

    const {images, videos, audios, others} = data;

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
                        images?.length ?
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
                                        images.slice(0, 6).map(img => <div key={img.id} className="vl-item br-5"></div>)
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
                        videos?.length ?

                            <div className="videos-brief fw view-link" data-href="#vid-slide">
                                <button className="flex mid-align fw no-btn pad vlh body-btn" onClick={() => goTo("videos")}>
                                    <div className="vlt fw"> Videos </div>
                                    <small className='flex mid-align gap-3'>
                                        <span>{ }</span>
                                        <FontAwesomeIcon icon={faAngleRight} />
                                    </small>
                                </button>
                                <div className="vl-items-cont max gap-2">
                                    {videos.slice(0, 6).map(vid => <div key={vid.id} className="vl-item br-5"></div>)}

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
                        audios?.length ?
                            <div className="audios-brief fw view-link" data-href="#aud-slide">
                                <button className="flex mid-align fw no-btn pad vlh body-btn" onClick={() => goTo("audios")}>
                                    <div className="vlt fw"> Audios </div>
                                    <small className='flex mid-align gap-3'>
                                        <span>{ }</span>
                                        <FontAwesomeIcon icon={faAngleRight} />
                                    </small>
                                </button>
                                <div className="vl-items-cont max gap-2">
                                    {audios.slice(0, 6).map(aud => <div key={aud.id} className="vl-item br-5"></div>)}

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
                        others?.length ?
                            <div className="others-brief fw view-link" data-href="#oth-slide">
                                <button className="flex mid-align fw no-btn pad vlh body-btn" onClick={() => goTo("others")}>
                                    <div className="vlt fw"> Others </div>
                                    <small className='flex mid-align gap-3'>
                                        <span>{ }</span>
                                        <FontAwesomeIcon icon={faAngleRight} />
                                    </small>
                                </button>
                                <div className="vl-items-cont max gap-2">
                                    {others.slice(0, 6).map(oth => <div key={oth.id} className="vl-item br-5"></div>)}

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