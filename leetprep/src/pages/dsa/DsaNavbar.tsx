import React from "react";
import { NavLink } from "react-router-dom";

const DsaNavbar = () => {
  return (
    <nav className="navbar navbar-dark bg-dark px-3">
      <NavLink to="/" className="navbar-brand">InterviewKit+</NavLink>
      <div className="d-flex gap-4">
        <NavLink to="/dsa/dashboard" className="nav-link text-white">Dashboard</NavLink>
        <NavLink to="/dsa/problems" className="nav-link text-white">Problems</NavLink>
        <NavLink to="/dsa/submissions" className="nav-link text-white">Submissions</NavLink>
      </div>
    </nav>
  );
};

export default DsaNavbar;