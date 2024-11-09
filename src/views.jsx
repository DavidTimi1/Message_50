import { forwardRef, useState } from "react";

import { IconBut } from "./buttons";



export const View = forwardRef(({children, viewHead}, ref) => {

    return (
        <div className="view-container mega-max close" ref={ref}>
            <div className="max">
                <div className="view fw flex-col max">
                    { viewHead }
                    <div className="content fw grow">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
})


export function ViewHead({children}){
    return (
        <div className="heading fw flex mid-align gap-2">
            {children}
        </div>
    )
}