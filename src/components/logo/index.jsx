import React from "react";
import PropTypes from "prop-types";
import logoImage from "assets/images/LOGO.png";

const Logo = ({ width = "auto", height = "auto", className = "" }) => {
  return (
    <img
      src={logoImage}
      alt="Logo"
      width={width}
      height={height}
      className={className}
    />
  );
};

Logo.propTypes = {
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
};

export default Logo; 