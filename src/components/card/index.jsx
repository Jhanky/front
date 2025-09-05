function Card(props) {
  const { variant, extra, children, ...rest } = props;
  return (
    <div
      className={`!z-5 relative flex flex-col rounded-[20px] bg-primary-card bg-clip-border shadow-[0_8px_16px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_20px_rgba(0,0,0,0.4)] transition-shadow duration-300 text-text-primary ${extra}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export default Card;
