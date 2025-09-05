/* eslint-disable */

import { HiX } from "react-icons/hi";
import Links from "./components/Links";

import routes from "routes.js";

const Sidebar = ({ open, onClose }) => {
  return (
    <div
      className={`sm:none duration-175 linear fixed !z-50 flex min-h-full flex-col bg-primary-card pb-10 shadow-2xl shadow-black/20 transition-all text-text-primary md:!z-50 lg:!z-50 xl:!z-0 ${
        open ? "translate-x-0" : "-translate-x-96"
      }`}
    >
      <span
        className="absolute top-4 block cursor-pointer end-4 xl:hidden"
        onClick={onClose}
      >
        <HiX />
      </span>

      <div className={`mx-[56px] mt-[50px] flex items-center`}>
        <div className="mt-1 h-2.5 font-poppins text-[26px] font-bold uppercase text-text-primary ms-1">
          Horizon <span class="font-medium">FREE</span>
        </div>
      </div>
      <div class="mt-[58px] mb-7 h-px bg-text-disabled/30" />
      {/* Nav item */}

      <ul className="mb-auto pt-1">
        <Links routes={routes} />
      </ul>


      {/* Nav item end */}
    </div>
  );
};

export default Sidebar;
