
import { forwardRef, useEffect } from "react";


export const AudiosList = forwardRef((props, ref) => {
    const { data, preview, viewObserver } = props;

    useEffect(() => {
        viewObserver.observe(ref.current);
    }, [ref, viewObserver]);

    return (
        <div className="media-view max" data-section="audios" ref={ref}>
            <div className='max custom-scroll' style={{ overflow: "hidden auto" }}>
                <div className="max" style={{padding: "10px"}}>
                    {
                        data && data.length?
                        
                            <div className='flex' style={{ flexWrap: "wrap" }}>
                                {
                                    data?.map?.(aud =>
                                        <div key={aud.id} className="media-grid-item br-5">{aud.src}</div>
                                    )
                                }
                            </div>
                        : 
                            <div className="abs-mid center-text">
                                You do not have any Audios stored yet ...
                            </div>
                    }
                </div>
            </div>
        </div>
    )
})