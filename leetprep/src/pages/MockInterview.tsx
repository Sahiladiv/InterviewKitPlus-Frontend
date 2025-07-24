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

const MockInterview: React.FC = () => {
  const [questionType, setQuestionType] = useState<QuestionType>("technical");
  const [question, setQuestion] = useState<Question>(initialQuestion);

  const [answer, setAnswer] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");

  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [resumeUploadMessage, setResumeUploadMessage] = useState<string>("");

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
      const token = localStorage.getItem("access");
      const res = await fetch(
        "https://interviewkitplusapi.onrender.com/api/mock/generate-question/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data: APIResponse = await res.json();
      console.log("Fetched question:", data);

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
        console.error("Error fetching question:", data.error || "Unknown error");
        setQuestion(initialQuestion);
      }
    } catch (err) {
      console.error("Fetch error:", err);
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
      // TODO: Call your evaluation endpoint here with `answer` + `question`
      setFeedback("✅ Answer submitted successfully. Here's what you could improve...");
    } catch (error) {
      setFeedback("❌ Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("access");

    try {
      const res = await fetch("http://localhost:8000/api/upload-resume/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setResumeUploadMessage("✅ Resume uploaded and parsed successfully!");
        console.log("Extracted resume text:", data.text);
      } else {
        setResumeUploadMessage(
          `❌ Failed to upload resume: ${data.error || "Unknown error"}`
        );
      }
    } catch (err) {
      console.error("Resume upload failed:", err);
      setResumeUploadMessage("❌ Resume upload failed.");
    }
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
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
          <Button
            variant="outline-secondary"
            onClick={fetchQuestion}
            disabled={questionLoading}
          >
            {questionLoading ? (
              <>
                <Spinner
                  animation="border"
                  size="sm"
                  className="me-2"
                  role="status"
                />
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
          <Card.Header className="d-flex justify-content-between align-items-center">
              <span>
                {questionType === "technical"
                  ? "Technical Question"
                  : "Behavioral Prompt"}
              </span>
            </Card.Header>
            <Card.Body style={{ whiteSpace: "pre-wrap" }}>
              {questionType === "technical" ? (
                questionLoading ? (
                  <div className="d-flex align-items-center gap-2">
                    <Spinner animation="border" size="sm" />
                    <span>Loading question…</span>
                  </div>
                ) : question.title ? (
                  <>
                    <h5 className="mb-3">{question.title}</h5>

                    {question.description && (
                      <p>
                        <strong>Description:</strong> {question.description}
                      </p>
                    )}

                    {question.input_format && (
                      <p>
                        <strong>Input Format:</strong> {question.input_format}
                      </p>
                    )}

                    {question.output_format && (
                      <p>
                        <strong>Output Format:</strong> {question.output_format}
                      </p>
                    )}

                    {question.constraints && (
                      <p>
                        <strong>Constraints:</strong> {question.constraints}
                      </p>
                    )}

                    {question.example_input && (
                      <div className="mb-2">
                        <strong>Example Input:</strong>
                        <pre className="bg-light p-2 rounded">
                          {question.example_input}
                        </pre>
                      </div>
                    )}

                    {question.example_output && (
                      <div className="mb-2">
                        <strong>Example Output:</strong>
                        <pre className="bg-light p-2 rounded">
                          {question.example_output}
                        </pre>
                      </div>
                    )}

                    {question.test_cases.length > 0 && (
                      <div className="mt-3">
                        <strong>Test Cases:</strong>
                        {question.test_cases.map((tc, idx) => (
                          <Card key={idx} className="mt-2">
                            <Card.Body>
                              <p className="mb-1">
                                <strong>Input:</strong>
                              </p>
                              <pre className="bg-light p-2 rounded">
                                {tc.input}
                              </pre>
                              <p className="mb-1">
                                <strong>Output:</strong>
                              </p>
                              <pre className="bg-light p-2 rounded">
                                {tc.output}
                              </pre>
                              {tc.explanation && (
                                <>
                                  <p className="mb-1">
                                    <strong>Explanation:</strong>
                                  </p>
                                  <pre className="bg-light p-2 rounded">
                                    {tc.explanation}
                                  </pre>
                                </>
                              )}
                            </Card.Body>
                          </Card>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p>No question found. Try generating a new one.</p>
                )
              ) : (
                <>
                  <h5>Behavioral Interview</h5>
                  <p>
                    Click “Start Recording” to begin answering your behavioral
                    question.
                  </p>
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
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    automaticLayout: true,
                  }}
                />
              </div>
              <div className="text-end">
                <Button
                  variant="success"
                  onClick={handleSubmit}
                  disabled={!answer || loading}
                >
                  {loading ? "Evaluating..." : "Submit"}
                </Button>
              </div>
            </>
          ) : (
            <Card>
              <Card.Body>
                <h5>Video Interview</h5>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-100 bg-dark rounded shadow-sm"
                  style={{ height: 300 }}
                />
                <div className="d-flex gap-2 mt-3">
                  <Button
                    onClick={startRecording}
                    disabled={recording}
                    variant="outline-primary"
                  >
                    Start Recording
                  </Button>
                  <Button
                    onClick={stopRecording}
                    disabled={!recording}
                    variant="outline-danger"
                  >
                    Stop Recording
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Resume upload (optional UI) */}
          <Card className="mt-3">
            <Card.Body>
              <h6>Upload Resume (optional)</h6>
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // store or directly upload
                    handleResumeUpload(file);
                  }
                }}
              />
              {resumeUploadMessage && (
                <Alert
                  className="mt-2"
                  variant={
                    resumeUploadMessage.startsWith("✅") ? "success" : "danger"
                  }
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
