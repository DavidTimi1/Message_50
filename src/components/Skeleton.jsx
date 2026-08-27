import React from 'react';
import './Skeleton.css';

export const Skeleton = ({ width = '100%', height = '20px', borderRadius = '4px', className = '', style = {} }) => {
    return (
        <div 
            className={`skeleton-loader ${className}`}
            style={{
                width,
                height,
                borderRadius,
                ...style
            }}
        ></div>
    );
};
