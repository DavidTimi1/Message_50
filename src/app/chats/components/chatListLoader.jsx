import Skeleton from "@/app/components/skeleton";
import { useEffect, useState } from "react";

const LoadingChatList = ({ count = 3 }) => {
    const skeletons = Array.from({ length: count }, (_, index) => (
      <LoadingChatListItem key={index} />
    ));
    
    return (
      <ul className="list-unstyled">
        {skeletons}
      </ul>
    );
  };

  export default LoadingChatList;


const LoadingChatListItem = () => {
  const [returnContent, setReturnContent] = useState(<></>);
  const loaderContent = (
    <li className='chat-cont br-1'>
      <div className='abs-mid br-1 max'>
        <div className='fw flex mid-align'>
        </div>
      </div>
      <div className='max mid-align flex gap-2 br-1' style={{ padding: "10px 5px" }}>
        {/* User Profile Picture and Info */}
        <div className='flex'>
          <Skeleton height="3.5rem" width="3.5rem" className="rounded-circle" />
        </div>

        {/* User Details and Last Message */}
        <div className="flex-col details grow gap-1">
          <div className="flex fw" style={{ justifyContent: "space-between", alignItems: "baseline" }}>
            {/* User name */}
            <div className="user grow crop-excess">
              <Skeleton height="1rem" width="10rem" />
            </div>
            {/* Last message time */}
            <small className='tl'>
              <Skeleton height="0.75rem" width="3rem" />
            </small>
          </div>
          <div className='grow crop-excess'>
            <div className="flex chat-msg gap-1 mid-align">
              {/* Last message text */}
              <Skeleton height="1rem" width="15rem" />
            </div>
          </div>
        </div>
      </div>
    </li>
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      setReturnContent(loaderContent);
    }, 500); // Delay of 500ms before showing the content

    return () => clearTimeout(timer);
  }, [loaderContent]);
  
  return returnContent
};