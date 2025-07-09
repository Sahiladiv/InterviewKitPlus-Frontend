import React from "react";
import { Container, Card, Button } from "react-bootstrap";

const Behavioral: React.FC = () => {
  return (
    <Container className="mt-5">
      <h2 className="fw-bold text-center mb-4">🧠 Behavioral Interview Prep</h2>

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Card.Title className="fw-semibold">What is the STAR Method?</Card.Title>
          <Card.Text>
            The <strong>STAR</strong> method is a structured approach for answering behavioral interview questions clearly and concisely.
          </Card.Text>
          <ul>
            <li><strong>S — Situation:</strong> Describe the context or background.</li>
            <li><strong>T — Task:</strong> Explain the challenge or goal you faced.</li>
            <li><strong>A — Action:</strong> Detail the specific steps you took.</li>
            <li><strong>R — Result:</strong> Share the outcome and impact of your actions.</li>
          </ul>
        </Card.Body>
      </Card>

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Card.Title className="fw-semibold">📌 Example Question</Card.Title>
          <Card.Text><em>“Tell me about a time you handled a difficult team member.”</em></Card.Text>

          <h6 className="mt-3">⭐ Sample STAR Answer:</h6>
          <ul>
            <li><strong>Situation:</strong> During a group project in my senior year, one teammate consistently missed deadlines.</li>
            <li><strong>Task:</strong> As the project lead, I needed to keep the team on track while resolving the issue.</li>
            <li><strong>Action:</strong> I scheduled a private meeting, listened to their concerns, and reassigned tasks based on strengths.</li>
            <li><strong>Result:</strong> The project was completed ahead of time, and the teammate became more engaged moving forward.</li>
          </ul>
        </Card.Body>
      </Card>

      <div className="text-center">
        <Button variant="outline-primary" href="/mock-behavioral">
          Practice Behavioral Rounds →
        </Button>
      </div>
    </Container>
  );
};

export default Behavioral;
