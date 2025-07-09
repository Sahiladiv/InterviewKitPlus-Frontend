import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import DsaLayout from "./pages/dsa/DsaLayout";
import Solve from "./pages/Solve";
import MockInterview from "./pages/MockInterview";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Behavioral from "./pages/Behavioral";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/mock-interview" element={<MockInterview />} />
        <Route path="/behavioral" element={<Behavioral />} />

        <Route path="/dsa/*" element={<DsaLayout />} />
        <Route path="/dsa/solve/:id" element={<Solve />} />
      </Routes>
    </Router>
  );
};

export default App;
