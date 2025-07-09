import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Container, Row, Col } from "react-bootstrap";
import Navbar from "../components/Navbar";

const Home: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "Data Structures & Algorithms",
      description: "Practice and solve curated coding problems to master DSA.",
      route: "/dsa",
    },
    {
      title: "Resume Optimization",
      description: "Get AI-powered resume suggestions tailored to tech roles.",
      route: "/resume",
    },
    {
      title: "Mock Interviews",
      description: "Practice real interview rounds with instant feedback using AI.",
      route: "/mock-interview",
    },
    {
      title: "System Design",
      description: "Build and evaluate high-level scalable system designs.",
      route: "/system-design",
    },
    {
      title: "Behavioral Rounds",
      description: "Prepare STAR-style responses for top tech companies.",
      route: "/behavioral",
    },
    {
      title: "Career Coaching",
      description: "One-on-one mentoring and job strategy sessions.",
      route: "/career",
    },
  ];

  return (
    <>
      <Navbar />
      <Container className="my-5">
        <h2 className="text-center mb-5">
          <span role="img" aria-label="rocket">🚀</span> <strong>InterviewKit+</strong>
        </h2>
        <Row xs={1} md={2} lg={3} className="g-4">
          {features.map((feature, idx) => (
            <Col key={idx}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Body>
                  <Card.Title className="fw-bold">
                     {feature.title}
                  </Card.Title>
                  <Card.Text className="text-muted">{feature.description}</Card.Text>
                  <Button
                    variant="outline-primary"
                    onClick={() => navigate(feature.route)}
                    className="mt-3"
                  >
                    Explore →
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default Home;
