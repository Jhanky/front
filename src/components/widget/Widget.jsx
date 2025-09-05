import Card from "components/card";

const Widget = ({ icon, title, subtitle }) => {
  return (
    <Card extra="!flex-row flex-grow items-center rounded-[20px]">
      <div className="ml-[18px] flex h-[90px] w-auto flex-row items-center">
        <div className="rounded-full bg-accent-primary/20 p-3">
          <span className="flex items-center text-accent-primary">
            {icon}
          </span>
        </div>
      </div>

      <div className="h-50 ml-4 flex w-auto flex-col justify-center">
        <p className="font-dm text-sm font-medium text-text-secondary">{title}</p>
        <h4 className="text-xl font-bold text-text-primary">
          {subtitle}
        </h4>
      </div>
    </Card>
  );
};

export default Widget;
