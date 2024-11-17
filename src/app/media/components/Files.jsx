

import { faFile } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { forwardRef, useEffect } from "react";


export const OthersList = forwardRef((props, ref) => {
    const { preview, viewObserver } = props;

    useEffect(() => {
        viewObserver.observe(ref.current);
    }, [ref, viewObserver]);

    return (
        <div className="media-view max" data-section="others" ref={ref}>
            <div className='max custom-scroll' style={{ overflow: "hidden auto" }}>
                <div className='fw flex-col gap-1' style={{padding: "10px"}}>
                    {
                        others.map(oth => {
                            const { fileSize, fileExt, name } = oth;

                            return (
                                <div key={oth.id} className="fw br-5 media-list-item">
                                    <div className="fw flex mid-align gap-2" style={{ padding: "5px" }}>
                                        <div>
                                            <FontAwesomeIcon icon={faFile} size="xl" />
                                        </div>
                                        <div className="flex-col grow gap-1">
                                            <div className="crop-excess">
                                                {name}
                                            </div>
                                            <div className="fw">
                                                <small>
                                                    <span>{fileSize}</span>
                                                    <span>•</span>
                                                    <span>{fileExt}</span>
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </div>
    )
});

const others = [{ src: "doc1", name: "Doc1", id: 1 }, { src: "doc2", name: "Doc2", id: 2 }, { src: "doc3", name: "Doc3", id: 3 }, { src: "doc4", name: "Doc4", id: 4 }, { src: "doc5", name: "Doc5", id: 5 }];