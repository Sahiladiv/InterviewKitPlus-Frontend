import React, { useEffect, useState } from "react";
import { Tab, Nav, Row, Col } from "react-bootstrap";
import DashboardSummary from "../components/DashboardSummary";
import axios from "axios";

const Dashboard: React.FC = () => {
  const [solved, setSolved] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get("/api/dashboard/stats/");
        setSolved(res.data.solved);
        setTotal(res.data.total_problems);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch summary:", err);
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  return (
    <div className="container mt-5 pt-4">
      <h2 className="mb-4">📊 Your Dashboard</h2>

      <Tab.Container defaultActiveKey="summary">
        <Row>
          <Col sm={3}>
            <Nav variant="pills" className="flex-column">
              <Nav.Item>
                <Nav.Link eventKey="summary">Summary</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="difficulty">Difficulty Graph</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="tags">Tag Stats</Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>

          <Col sm={9}>
            <Tab.Content>
              <Tab.Pane eventKey="summary">
                {loading ? (
                  <p>Loading summary...</p>
                ) : (
                  <div className="d-flex align-items-center">
                    <DashboardSummary solved={solved} total={total} />
                    <div className="ms-4">
                      <p>
                        You've solved <strong>{solved}</strong> out of <strong>{total}</strong> problems!
                      </p>
                      <p>Keep going and track your progress here 🎯</p>
                    </div>
                  </div>
                )}
              </Tab.Pane>

              <Tab.Pane eventKey="difficulty">
                <p>[📈 Difficulty Graph will be rendered here]</p>
              </Tab.Pane>

              <Tab.Pane eventKey="tags">
                <p>[🏷️ Tag-based statistics will be displayed here]</p>
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </div>
  );
};

export default Dashboard;
