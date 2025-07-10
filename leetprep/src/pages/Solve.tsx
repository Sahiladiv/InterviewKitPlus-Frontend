import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { Container, Button, Row, Col, Card, Alert, Spinner } from "react-bootstrap";

const Solve: React.FC = () => {
  const { id: problemId } = useParams();
  const [problem, setProblem] = useState<any>(null);
  const [code, setCode] = useState("// Write your code here...");
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "danger" | "info">("info");
  const [loading, setLoading] = useState(true);
  const [hintShown, setHintShown] = useState(false);
  const [explanationShown, setExplanationShown] = useState(false);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await fetch(`https://interviewkitplusapi.onrender.com/api/problems/problems/${problemId}/`);
        if (!res.ok) throw new Error("Problem not found.");
        const data = await res.json();
        setProblem(data);
      } catch (err) {
        console.error("Error fetching problem:", err);
        setProblem(null);
        setMessage("❌ Failed to load problem.");
        setMessageType("danger");
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId]);

  const handleCodeChange = (value: string | undefined) => {
    setCode(value || "");
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("access");
      const response = await fetch(`http://localhost:8000/api/submissions/${problemId}/submit/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code, language: "python" }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage(`✅ Submission successful! Submission ID: ${result.id}`);
        setMessageType("success");
      } else {
        setMessage(`❌ Submission failed: ${result.error || "Unknown error"}`);
        setMessageType("danger");
      }
    } catch (err) {
      console.error("Submission error:", err);
      setMessage("❌ Submission error. Please try again.");
      setMessageType("danger");
    }
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading problem...</p>
      </Container>
    );
  }

  if (!problem || Object.keys(problem).length === 0) {
    return (
      <Container className="mt-5 text-center">
        <Alert variant="warning">
          ⚠️ Problem data is empty or could not be parsed.
          <pre className="text-start mt-2">{JSON.stringify(problem, null, 2)}</pre>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col md={6} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <Card.Title className="fw-bold">{problem.title || "Untitled Problem"}</Card.Title>
              <Card.Text className="text-muted">
                {problem.description || "No description provided."}
              </Card.Text>

              {problem.example_input && (
                <div className="mt-3">
                  <h6 className="text-muted">Example Input</h6>
                  <pre className="bg-light border rounded p-2">{problem.example_input}</pre>
                </div>
              )}

              {problem.example_output && (
                <div className="mt-3">
                  <h6 className="text-muted">Example Output</h6>
                  <pre className="bg-light border rounded p-2">{problem.example_output}</pre>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <div style={{ height: "400px", marginBottom: "1rem" }}>
            <Editor
              language="python"
              value={code}
              onChange={handleCodeChange}
              theme="vs-dark"
              options={{ fontSize: 14 }}
            />
          </div>

          <div className="d-flex gap-2 mb-3">
            <Button variant="info" onClick={() => setHintShown(!hintShown)}>
              🧠 Hint
            </Button>
            <Button variant="secondary" onClick={() => setExplanationShown(!explanationShown)}>
              📘 Explanation
            </Button>
          </div>

          {hintShown && (
            <Alert variant="warning">
              Try solving it using a two-pointer approach starting from both ends.
            </Alert>
          )}

          {explanationShown && (
            <Alert variant="light">
              The key idea is to maximize the area formed between the lines by choosing the widest possible
              container and moving the pointer with the shorter height inward.
            </Alert>
          )}

          {message && <Alert variant={messageType}>{message}</Alert>}

          <div className="text-end">
            <Button variant="primary" onClick={handleSubmit}>
              Submit
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Solve;
