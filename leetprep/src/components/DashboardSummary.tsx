import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

interface Props {
  solved: number;
  total: number;
}

const DashboardSummary: React.FC<Props> = ({ solved, total }) => {
  const percentage = total === 0 ? 0 : Math.round((solved / total) * 100);

  return (
    <div style={{ width: 150, height: 150 }}>
      <CircularProgressbar
        value={percentage}
        text={`${percentage}%`}
        styles={buildStyles({
          textColor: "#333",
          pathColor: "#007bff",
          trailColor: "#e0e0e0",
        })}
      />
      <div className="text-center mt-2">
        <strong>{solved}</strong> solved out of <strong>{total}</strong>
      </div>
    </div>
  );
};

export default DashboardSummary;
