

const Skeleton = ({ height, width, className, ...props }) => {
  return (
    <div
      className={`rounded-2 placeholder-glow ${className}`}
      style={{ height, width, backgroundColor: "var(--body2-col)" }}
      {...props}
    >
      <span className="placeholder col-12 h-100 w-100"></span>
    </div>
  );
};

export default Skeleton;