import React, { useEffect, useState } from "react";
import { Table, Button, Spinner, Alert, Container } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";

const ProblemLibrary: React.FC = () => {
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const category = queryParams.get("category");

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        let url = "https://interviewkitplusapi.onrender.com/api/problems/problems/";
        if (category) {
          url += `?category=${encodeURIComponent(category)}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch problems");
        const data = await res.json();
        console.log("Fetched problems:", data);

        const extractedProblems = Array.isArray(data)
          ? data
          : data.problems || data.data || [];

        if (!Array.isArray(extractedProblems)) {
          throw new Error("Problems data is not an array.");
        }

        setProblems(extractedProblems);
      } catch (err) {
        console.error("Error fetching problems:", err);
        setError("\u274C Could not load problems. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, [category]);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
        <p>Loading problems...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mt-5 text-center">
        {error}
      </Alert>
    );
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4">
        Problem List {category && <span className="text-muted">({category})</span>}
      </h2>
      {problems.length === 0 ? (
        <p>No problems found{category ? ` for category: "${category}"` : ""}.</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Category</th>
              <th>Difficulty</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {problems.map((problem, index) => (
              <tr key={problem.id}>
                <td>{index + 1}</td>
                <td>{problem.title}</td>
                <td>{problem.category}</td>
                <td>
                  <span
                    className={`badge ${
                      problem.difficulty === "Easy"
                        ? "bg-success"
                        : problem.difficulty === "Medium"
                        ? "bg-warning text-dark"
                        : "bg-danger"
                    }`}
                  >
                    {problem.difficulty}
                  </span>
                </td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => navigate(`/dsa/solve/${problem.id}`)}
                  >
                    Solve →
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default ProblemLibrary;
