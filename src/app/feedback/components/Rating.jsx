import { useState } from "react";

import { faCircleXmark, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


export const Rating = ({initRate}) => {
    initRate = initRate ?? 0;

    return (
        <div className="flex-col">
            <h3>
                Rate this app 🌟:
            </h3>
            <div className='rating flex gap-2 mid-align'>
                <label style={{ color: "red" }}>
                    <FontAwesomeIcon icon={faCircleXmark} size="xl" />
                    <input type="radio" name="rating" className="" value="0" defaultChecked={initRate === 0}></input>
                </label>

                {
                    [1, 2, 3, 4, 5].map(i =>
                        <label className="star" key={i}>
                            <FontAwesomeIcon icon={faStar} size="2x" />
                            <input className="" type="radio" name="rating" value={i} defaultChecked={initRate === i}></input>
                        </label>
                    )
                }
            </div>
        </div>
    )

}
