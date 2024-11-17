
import { forwardRef, useEffect } from "react";


export const AudiosList = forwardRef((props, ref) => {
    const { preview, viewObserver } = props;

    useEffect(() => {
        viewObserver.observe(ref.current);
    }, [ref, viewObserver]);

    return (
        <div className="media-view max" data-section="audios" ref={ref}>
            <div className='max custom-scroll' style={{ overflow: "hidden auto" }}>
                <div className="max" style={{padding: "10px"}}>
                    <div className='flex' style={{ flexWrap: "wrap" }}>
                        {
                            audios.map(aud =>
                                <div key={aud.id} className="media-grid-item br-5">{aud.src}</div>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    )
})

const audios = [{ src: "aud1", id: 1 }, { src: "aud2", id: 2 }, { src: "aud3", id: 3 }, { src: "aud4", id: 4 }, { src: "aud5", id: 5 }];
