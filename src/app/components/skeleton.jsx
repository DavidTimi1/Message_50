

const Skeleton = ({ height, width, className, ...props }) => {
  return (
    <div
      className={`rounded-2 placeholder-glow flex ${className}`}
      style={{ height, width, backgroundColor: "var(--body2-col)" }}
      {...props}
    >
      <div className="placeholder max top-0" style={{borderRadius: "inherit"}}></div>
    </div>
  );
};

export default Skeleton;