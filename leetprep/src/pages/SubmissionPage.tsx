import React, { useEffect, useState } from "react";
import { Container, Table, Spinner, Alert } from "react-bootstrap";

interface Submission {
  id: number;
  problem_title: string;
  submitted_code: string;
  submitted_at: string;
}

const SubmissionPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const accessToken = localStorage.getItem("access");

        const response = await fetch("http://localhost:8000/api/submissions/", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch submissions.");
        }

        const data = await response.json();
        setSubmissions(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  return (
    <Container className="mt-5">
      <h2 className="mb-4 text-center">📜 My Submissions</h2>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : submissions.length === 0 ? (
        <Alert variant="info">You haven’t submitted any problems yet.</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Problem</th>
              <th>Submitted Code</th>
              <th>Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission, index) => (
              <tr key={submission.id}>
                <td>{index + 1}</td>
                <td>{submission.problem_title}</td>
                <td>
                  <pre style={{ whiteSpace: "pre-wrap" }}>
                    {submission.submitted_code}
                  </pre>
                </td>
                <td>{new Date(submission.submitted_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default SubmissionPage;
