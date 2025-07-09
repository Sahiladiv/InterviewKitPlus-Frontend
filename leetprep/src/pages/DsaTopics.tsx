import React from "react";
import { Card, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const topics = [
  { name: "Array", route: "/dsa/problems?tag=Array" },
  { name: "String", route: "/dsa/problems?tag=String" },
  { name: "Linked List", route: "/dsa/problems?tag=Linked List" },
  { name: "Tree", route: "/dsa/problems?tag=Tree" },
  { name: "Graph", route: "/dsa/problems?tag=Graph" },
  { name: "DP", route: "/dsa/problems?tag=DP" },
];

const DsaTopics: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container className="mt-4">
      <h2 className="mb-4">🧮 Choose a DSA Topic</h2>
      <Row xs={1} md={2} lg={3} className="g-4">
        {topics.map((topic, index) => (
          <Col key={index}>
            <Card className="shadow-sm h-100" onClick={() => navigate(topic.route)} style={{ cursor: "pointer" }}>
              <Card.Body>
                <Card.Title>{topic.name}</Card.Title>
                <Card.Text>Explore problems related to {topic.name}.</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default DsaTopics;
