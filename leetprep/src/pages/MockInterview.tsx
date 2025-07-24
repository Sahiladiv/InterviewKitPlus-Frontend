import React, { useCallback, useEffect, useRef, useState } from "react";
import { Container, Row, Col, Card, Button, Alert, Spinner } from "react-bootstrap";
import Editor from "@monaco-editor/react";

type QuestionType = "technical" | "behavioral";

type TestCase = {
  input: string;
  output: string;
  explanation?: string;
};

type APIQuestion = {
  title?: string;
  problem?: string;
  input_format?: string;
  output_format?: string;
  constraints?: string;
  test_cases?: TestCase[];
};

type APIResponse = {
  question?: APIQuestion;
  prompt_used?: string;
  error?: string;
};

type Question = {
  title: string;
  description: string;
  example_input: string;
  example_output: string;
  input_format: string;
  output_format: string;
  constraints: string;
  test_cases: TestCase[];
};

const initialQuestion: Question = {
  title: "",
  description: "",
  example_input: "",
  example_output: "",
  input_format: "",
  output_format: "",
  constraints: "",
  test_cases: [],
};

const API_BASE = "https://interviewkitplusapi.onrender.com";
const RESUME_UPLOAD_URL = "http://localhost:8000/api/upload-resume/";

// -----------------------
// Token Refresh Utilities
// -----------------------

async function refreshAccessToken(): Promise<string | null> {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) return null;

  const res = await fetch(`${API_BASE}/api/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) return null;

  const data = await res.json();
  const newAccess = data.access;
  if (newAccess) {
    localStorage.setItem("access", newAccess);
    return newAccess;
  }
  return null;
}

async function fetchWithTokenRefresh(url: string, init: RequestInit = {}): Promise<Response> {
  let access = localStorage.getItem("access");

  const doFetch = async (token?: string) =>
    fetch(url, {
      ...init,
      headers: {
        ...(init.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });

  let res = await doFetch(access || undefined);

  if (res.status === 401) {
    const newAccess = await refreshAccessToken();
    if (!newAccess) return res;
    res = await doFetch(newAccess);
  }

  return res;
}

// --------------------------
// Component
// --------------------------

const MockInterview: React.FC = () => {
  const [questionType, setQuestionType] = useState<QuestionType>("technical");
  const [question, setQuestion] = useState<Question>(initialQuestion);
  const [answer, setAnswer] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [resumeUploadMessage, setResumeUploadMessage] = useState<string>("");

  const [recording, setRecording] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchQuestion = useCallback(async () => {
    if (questionType !== "technical") {
      setQuestion(initialQuestion);
      setAnswer("");
      setFeedback("");
      return;
    }

    setQuestionLoading(true);

    try {
      let res = await fetchWithTokenRefresh(`${API_BASE}/api/mock/generate-question/`);
      let data: any;

      try {
        data = await res.json();
      } catch (err) {
        console.error("Failed to parse response JSON", err);
        throw new Error("Invalid response format");
      }

      console.log("Fetched question:", data);

      if (res.status === 401 || data?.code === "token_not_valid") {
        console.warn("Token invalid or expired:", data);
        setQuestion(initialQuestion);
        return;
      }

      if (res.ok && data?.question) {
        const q = data.question;
        setQuestion({
          title: q.title || "Untitled",
          description: q.problem || "",
          example_input: q.test_cases?.[0]?.input || "",
          example_output: q.test_cases?.[0]?.output || "",
          input_format: q.input_format || "",
          output_format: q.output_format || "",
          constraints: q.constraints || "",
          test_cases: q.test_cases || [],
        });
      } else {
        console.error("Error fetching question:", data?.detail || data?.error || "Unknown error");
        setQuestion(initialQuestion);
      }
    } catch (err) {
      console.error("Network or unknown error:", err);
      setQuestion(initialQuestion);
    } finally {
      setAnswer("");
      setFeedback("");
      setQuestionLoading(false);
    }
  }, [questionType]);

  useEffect(() => {
    fetchQuestion();
  }, [questionType, fetchQuestion]);

  const handleAnswerChange = (value: string | undefined) => {
    setAnswer(value || "");
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Integrate answer evaluation logic if needed
      setFeedback("✅ Answer submitted successfully. Here's what you could improve...");
    } catch {
      setFeedback("❌ Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetchWithTokenRefresh(RESUME_UPLOAD_URL, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setResumeUploadMessage("✅ Resume uploaded and parsed successfully!");
        console.log("Extracted resume text:", data.text);
      } else {
        setResumeUploadMessage(`❌ Resume upload failed: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Resume upload failed:", err);
      setResumeUploadMessage("❌ Resume upload failed.");
    }
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (videoRef.current) videoRef.current.srcObject = stream;
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    setRecordedChunks([]);

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) setRecordedChunks((prev) => [...prev, e.data]);
    };

    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <Container className="mt-4">
      <div className="mb-3 w-100 d-flex justify-content-start gap-2">
        <select
          value={questionType}
          onChange={(e) => setQuestionType(e.target.value as QuestionType)}
          className="form-select w-auto"
        >
          <option value="technical">🧠 Technical</option>
          <option value="behavioral">💬 Behavioral</option>
        </select>
        {questionType === "technical" && (
          <Button variant="outline-secondary" onClick={fetchQuestion} disabled={questionLoading}>
            {questionLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" role="status" />
                Generating…
              </>
            ) : (
              "Generate new question"
            )}
          </Button>
        )}
      </div>

      <Row>
        <Col md={6} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              {questionType === "technical" ? "Technical Question" : "Behavioral Prompt"}
            </Card.Header>
            <Card.Body>
              {questionType === "technical" ? (
                questionLoading ? (
                  <div className="d-flex align-items-center gap-2">
                    <Spinner animation="border" size="sm" />
                    <span>Loading question…</span>
                  </div>
                ) : question.description || question.title ? (
                  <>
                    <h5>{question.title}</h5>
                    <p><strong>Description:</strong> {question.description}</p>
                    <p><strong>Input Format:</strong> {question.input_format}</p>
                    <p><strong>Output Format:</strong> {question.output_format}</p>
                    <p><strong>Constraints:</strong> {question.constraints}</p>
                    <p><strong>Example Input:</strong></p>
                    <pre className="bg-light p-2">{question.example_input}</pre>
                    <p><strong>Example Output:</strong></p>
                    <pre className="bg-light p-2">{question.example_output}</pre>
                  </>
                ) : (
                  <p>No question found. Try generating a new one.</p>
                )
              ) : (
                <>
                  <h5>Behavioral Interview</h5>
                  <p>Click “Start Recording” to begin answering your behavioral question.</p>
                </>
              )}
            </Card.Body>
          </Card>

          {feedback && (
            <Alert className="mt-3" variant="info">
              <strong>💡 AI Feedback: </strong>
              <p className="mb-0">{feedback}</p>
            </Alert>
          )}
        </Col>

        <Col md={6}>
          {questionType === "technical" ? (
            <>
              <div style={{ height: "400px", marginBottom: "1rem" }}>
                <Editor
                  height="100%"
                  language="python"
                  theme="vs-dark"
                  value={answer}
                  onChange={handleAnswerChange}
                  options={{ fontSize: 14, minimap: { enabled: false }, automaticLayout: true }}
                />
              </div>
              <div className="text-end">
                <Button variant="success" onClick={handleSubmit} disabled={!answer || loading}>
                  {loading ? "Evaluating..." : "Submit"}
                </Button>
              </div>
            </>
          ) : (
            <Card>
              <Card.Body>
                <h5>Video Interview</h5>
                <video ref={videoRef} autoPlay muted className="w-100 bg-dark rounded" style={{ height: 300 }} />
                <div className="d-flex gap-2 mt-3">
                  <Button onClick={startRecording} disabled={recording} variant="outline-primary">
                    Start Recording
                  </Button>
                  <Button onClick={stopRecording} disabled={!recording} variant="outline-danger">
                    Stop Recording
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}

          <Card className="mt-3">
            <Card.Body>
              <h6>Upload Resume (optional)</h6>
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleResumeUpload(file);
                }}
              />
              {resumeUploadMessage && (
                <Alert
                  className="mt-2"
                  variant={resumeUploadMessage.startsWith("✅") ? "success" : "danger"}
                >
                  {resumeUploadMessage}
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default MockInterview;
