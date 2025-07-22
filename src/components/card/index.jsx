function Card(props) {
  const { variant, extra, children, ...rest } = props;
  return (
    <div
      className={`!z-5 relative flex flex-col rounded-[20px] bg-navy-800 bg-clip-border shadow-[0_8px_16px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_20px_rgba(0,0,0,0.2)] transition-shadow duration-300 dark:!bg-navy-800 dark:text-white dark:shadow-none ${extra}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export default Card;
