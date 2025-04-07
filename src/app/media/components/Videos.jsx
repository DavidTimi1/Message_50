
import { forwardRef, useEffect } from "react";
import { VidThmb } from "../page";



export const VideosList = forwardRef((props, ref) => {
    const { data, preview, viewObserver } = props;

    useEffect(() => {
        viewObserver.observe(ref.current);

    }, [ref, viewObserver]);


    return (
        <div className="media-view max" data-section="videos" ref={ref}>
            <div className='max custom-scroll' style={{ overflow: "hidden auto" }}>
                <div className="max" style={{padding: "10px"}}>
                    {
                        data && data.length?
                        
                            <div className='flex' style={{ flexWrap: "wrap" }}>
                                {
                                    data.map(vid =>
                                        <div key={vid.id} className="media-grid-item br-5"> <VidThmb data={vid} /> </div>
                                    )
                                }
                            </div>
                        :
                            <div className="abs-mid center-text">
                                You do not have any Videos stored yet ...
                            </div>
                    }
                </div>
            </div>

        </div>
    )
})
