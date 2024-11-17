
import { forwardRef, useEffect } from "react";


export const ImagesList = forwardRef((props, ref) => {
    const { preview, viewObserver } = props;

    useEffect(() => {
        viewObserver.observe(ref.current);

    }, [ref, viewObserver]);

    return (
        <div className="media-view max" data-section="images" ref={ref}>
            <div className='max custom-scroll' style={{ overflow: "hidden auto" }}>
                <div className="max" style={{padding: "10px"}}>
                    <div className='flex' style={{ flexWrap: "wrap" }}>
                        {
                            images.map(img =>
                                <div key={img.id} className="media-grid-item br-5">{img.src}</div>
                            )
                        }
                    </div>
                </div>
            </div>

        </div>
    )
})


const images = [{ src: "img1", id: 1 }, { src: "img2", id: 2 }, { src: "img3", id: 3 }, { src: "img4", id: 4 }, { src: "img5", id: 5 }];
