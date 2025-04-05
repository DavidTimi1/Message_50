
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { forwardRef, useContext, useEffect } from "react";
import { SendMsgContext } from "../../contexts";
import axiosInstance from "../../../auth/axiosInstance";
import { apiHost } from "../../../App";
import { decryptMediaFile } from "../../crypt";
import { saveFile } from "../../../db";
import { AudThmb, ImgThmb, VidThmb } from "../page";
import { useState } from "react";
import { standardUnit } from "../../../utils";



export const Details = forwardRef((props, ref) => {
    const { data, viewObserver, goTo } = props;

    const {images, videos, audios, others} = data;
    const [storage, setStorage] = useState({used: 0, left: 0})

    useEffect(() => {
        async function calculateSpace() {
            if ('storage' in navigator && 'estimate' in navigator.storage) {
                const { usage, quota } = await navigator.storage.estimate();
                const used = standardUnit('data', usage);
                const left = standardUnit('data', quota);
                setStorage({ used, left });
            }
        }
        calculateSpace();
    }, []);

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
                                {storage.used}
                            </span>
                            {/* <small>GB</small> */}
                        </div>
                        <div className="fw">
                            <small> Out of </small> {storage.left} <small> Allocated Space </small>
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
                                        images.slice(0, 6).map(img => <div key={img.id} className="vl-item br-5"> <ImgThmb data={img} /> </div>)
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
                                    {videos.slice(0, 6).map(vid => <div key={vid.id} className="vl-item br-5">  <VidThmb data={vid} />  </div>)}

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
                                    {audios.slice(0, 6).map(aud => <div key={aud.id} className="vl-item br-5"> <AudThmb data={aud} /> </div>)}

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
                                    {others.slice(0, 6).map(oth => <div key={oth.id} className="vl-item br-5"> <AudThmb data={oth} /> </div>)}

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



export function useFileDownload(){
    const {updateMsgStatus}  = useContext(SendMsgContext);

    return {download}


    async function download(src, key, id){
        if (!src) return

        const mediaDownloadUrl = apiHost + "/chat/api/media/" + src;

        // get media metadata
        const metadata = await axiosInstance.get( `${mediaDownloadUrl}?metadata`, {
            withCredentials: true,
        }).then(response => response.data )

        // get media metadata
        await axiosInstance.get( mediaDownloadUrl, {
            responseType: 'arraybuffer',
            withCredentials: true,
            onDownloadProgress: (progressEvent) => {
                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                updateMsgStatus(id, progress / 100, undefined, "download");
            }
            
        }).then(async response => {
            const arraybuffer = response.data;
            const {type, iv, name} = metadata;
            const fileData = await decryptMediaFile(arraybuffer, iv, key);

            const blob = new Blob([fileData], {type});
            const file = new File([blob], name ?? "file", {type});
                    
            const fileId = await saveFile(file)
            const fileObj = {fileId};
    
            updateMsgStatus(id, true, fileObj, "download");

        })
    }
    
}