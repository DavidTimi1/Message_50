
import { forwardRef, useEffect } from "react";



export const VideosList = forwardRef((props, ref) => {
    const { preview, viewObserver } = props;

    useEffect(() => {
        viewObserver.observe(ref.current);

    }, [ref, viewObserver]);


    return (
        <div className="media-view max" data-section="videos" ref={ref}>
            <div className='max custom-scroll' style={{ overflow: "hidden auto" }}>
                <div className="max" style={{padding: "10px"}}>
                    <div className='flex' style={{ flexWrap: "wrap" }}>
                        {
                            videos.map(vid =>
                                <div key={vid.id} className="media-grid-item br-5">{vid.src}</div>
                            )
                        }
                    </div>
                </div>
            </div>

        </div>
    )
})

const videos = [{ src: "vid1", id: 1 }, { src: "vid2", id: 2 }, { src: "vid3", id: 3 }, { src: "vid4", id: 4 }, { src: "vid5", id: 5 }];
