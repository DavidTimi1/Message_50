import Skeleton from "@/app/components/skeleton";

const LoadingContactList = ({ count = 3 }) => {
    const skeletons = Array.from({ length: count }, (_, index) => (
        <LoadingContactListItem key={index} />
    ));

    return (
        <ul className="list-unstyled">
            {skeletons}
        </ul>
    );
};

export default LoadingContactList;


const LoadingContactListItem = () => {
    return (
        <div className="contact-cont br-5">
            <div className="max gap-2 flex mid-align">
                {/* Profile Picture */}
                <Skeleton height="3.5rem" width="3.5rem" className="rounded-circle" />

                {/* Name and Bio */}
                <div className="grow left-text flex-col">
                    <div className="fs-4 fw-800">
                        <Skeleton height="1.5rem" width="10rem" className="mb-2" />
                    </div>
                    <small className="crop-excess fw">
                        <Skeleton height="0.75rem" width="8rem" />
                    </small>
                </div>
            </div>
        </div>
    );
};