
import { forwardRef, useEffect } from "react";
import { ImgThmb } from "../page";


export const ImagesList = forwardRef((props, ref) => {
    const { preview, viewObserver, data } = props;

    useEffect(() => {
        viewObserver.observe(ref.current);

    }, [ref, viewObserver]);

    return (
        <div className="media-view max" data-section="images" ref={ref}>
            <div className='max custom-scroll' style={{ overflow: "hidden auto" }}>
                <div className="max" style={{padding: "10px"}}>
                    {
                        data && data.length?
                        
                            <div className='flex' style={{ flexWrap: "wrap" }}>
                                {
                                    data.map(img =>
                                        <div key={img.id} className="media-grid-item br-5"> <ImgThmb data={img} /> </div>
                                    )
                                }
                            </div>
                        :
                            <div className="abs-mid center-text">
                                You do not have any Images stored yet ...
                            </div>
                        
                    }
                </div>
            </div>
        </div>
    )
})
