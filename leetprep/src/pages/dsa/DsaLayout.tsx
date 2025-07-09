import React from "react";
import { Routes, Route } from "react-router-dom";
import DsaNavbar from "./DsaNavbar";
import ProblemLibrary from "../ProblemLibrary";
import Dashboard from "../Dashboard";
import SubmissionPage from "../SubmissionPage";
import DsaTopics from "../DsaTopics";

const DsaLayout = () => {
  return (
    <>
      <DsaNavbar />
      <div className="container mt-4">
        <Routes>
          <Route index element={<DsaTopics />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="problems" element={<ProblemLibrary />} />
          <Route path="submissions" element={<SubmissionPage />} />
        </Routes>
      </div>
    </>
  );
};

export default DsaLayout;