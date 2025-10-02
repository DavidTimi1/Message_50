import React from 'react';
import Skeleton from '@/app/components/skeleton';


export const LoadingMessageList = () => {
  return (
    <div className="d-flex flex-column p-3 gap-3">

      {/* Skeleton for an incoming message */}
      <div className="d-flex align-items-center gap-2">
        {/* <Skeleton height="2.5rem" width="2.5rem" className="rounded-circle" /> */}
        <Skeleton height="4rem" width="10rem" />
      </div>

      {/* Another incoming message */}
      <div className="d-flex align-items-center gap-2">
        {/* <Skeleton height="2.5rem" width="2.5rem" className="rounded-circle" /> */}
        <Skeleton height="4rem" width="15rem" />
      </div>

      {/* Skeleton for an outgoing message */}
      <div className="d-flex justify-content-end">
        <div className="d-flex align-items-center gap-2">
          <Skeleton height="4rem" width="12rem" />
          {/* <Skeleton height="2.5rem" width="2.5rem" className="rounded-circle" /> */}
        </div>
      </div>
      
      {/* A shorter outgoing message */}
      <div className="d-flex justify-content-end">
        <div className="d-flex align-items-center gap-2">
          <Skeleton height="4rem" width="8rem" />
          {/* <Skeleton height="2.5rem" width="2.5rem" className="rounded-circle" /> */}
        </div>
      </div>

      {/* Another incoming message */}
      <div className="d-flex align-items-center gap-2">
        {/* <Skeleton height="2.5rem" width="2.5rem" className="rounded-circle" /> */}
        <Skeleton height="4rem" width="18rem" />
      </div>
    </div>
  );
};


export const LoadingMessageInterface = () => {
  return (
    <div className="d-flex flex-column p-3 gap-3">
      {/* Skeleton for the user profile at the top */}
      <div className="d-flex align-items-center gap-3 border-bottom pb-3">
        {/* <Skeleton height="3rem" width="3rem" className="rounded-circle" /> */}
        <div className="d-flex flex-column">
          <Skeleton height="1.5rem" width="8rem" className="mb-2" />
          <Skeleton height="0.75rem" width="5rem" />
        </div>
      </div>

      {/* Skeleton for an incoming message */}
      <div className="d-flex align-items-center gap-2">
        {/* <Skeleton height="2.5rem" width="2.5rem" className="rounded-circle" /> */}
        <Skeleton height="4rem" width="10rem" />
      </div>

      {/* Another incoming message */}
      <div className="d-flex align-items-center gap-2">
        {/* <Skeleton height="2.5rem" width="2.5rem" className="rounded-circle" /> */}
        <Skeleton height="4rem" width="15rem" />
      </div>

      {/* Skeleton for an outgoing message */}
      <div className="d-flex justify-content-end">
        <div className="d-flex align-items-center gap-2">
          <Skeleton height="4rem" width="12rem" />
          {/* <Skeleton height="2.5rem" width="2.5rem" className="rounded-circle" /> */}
        </div>
      </div>
      
      {/* A shorter outgoing message */}
      <div className="d-flex justify-content-end">
        <div className="d-flex align-items-center gap-2">
          <Skeleton height="4rem" width="8rem" />
          {/* <Skeleton height="2.5rem" width="2.5rem" className="rounded-circle" /> */}
        </div>
      </div>

      {/* Another incoming message */}
      <div className="d-flex align-items-center gap-2">
        {/* <Skeleton height="2.5rem" width="2.5rem" className="rounded-circle" /> */}
        <Skeleton height="4rem" width="18rem" />
      </div>
    </div>
  );
};