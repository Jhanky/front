const Progress = (props) => {
  const { value, color, width } = props;
  return (
    <div
      className={`h-2 ${
        width ? width : "w-full"
      } rounded-full bg-text-disabled/20`}
    >
      <div
        className={`flex h-full items-center justify-center rounded-full ${
          color === "red"
            ? "bg-red-500"
            : color === "blue"
            ? "bg-blue-500"
            : color === "green"
            ? "bg-accent-primary"
            : color === "yellow"
            ? "bg-yellow-500"
            : color === "orange"
            ? "bg-orange-500"
            : color === "teal"
            ? "bg-teal-500"
            : color === "navy"
            ? "bg-navy-500"
            : color === "lime"
            ? "bg-lime-500"
            : color === "cyan"
            ? "bg-cyan-500"
            : color === "pink"
            ? "bg-pink-500"
            : color === "purple"
            ? "bg-purple-500"
            : color === "amber"
            ? "bg-amber-500"
            : color === "indigo"
            ? "bg-indigo-500"
            : color === "gray"
            ? "bg-gray-500"
            : "bg-accent-primary"
        }`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

export default Progress;
