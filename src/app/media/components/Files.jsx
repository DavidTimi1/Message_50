

import { faFile } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { forwardRef, useEffect } from "react";
import { FileThmb } from "../page";


export const OthersList = forwardRef((props, ref) => {
    const { data, preview, viewObserver } = props;

    useEffect(() => {
        viewObserver.observe(ref.current);
    }, [ref, viewObserver]);

    return (
        <div className="media-view max" data-section="others" ref={ref}>
            <div className='max custom-scroll' style={{ overflow: "hidden auto" }}>
                {
                    data && data.length?
                    
                        <div className='fw flex-col gap-1' style={{padding: "10px"}}>
                            {
                                data.map(oth => (
                                    <div key={oth.id} className="fw br-5 media-list-item">
                                        <FileThmb data={oth} type='other' />
                                    </div>
                                ))
                            }
                        </div>
                    :

                        <div className="abs-mid center-text">
                            You do not have any Files stored yet ...
                        </div>
                }
            </div>
        </div>
    )
});

const others = [{ src: "doc1", name: "Doc1", id: 1 }, { src: "doc2", name: "Doc2", id: 2 }, { src: "doc3", name: "Doc3", id: 3 }, { src: "doc4", name: "Doc4", id: 4 }, { src: "doc5", name: "Doc5", id: 5 }];