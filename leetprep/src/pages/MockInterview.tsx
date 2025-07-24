import React, { useEffect, useRef, useState } from "react";
import { Container, Row, Col, Card, Button, Alert } from "react-bootstrap";
import Editor from "@monaco-editor/react";

const MockInterview: React.FC = () => {
  const [questionType, setQuestionType] = useState<"technical" | "behavioral">("technical");
  const [question, setQuestion] = useState<any>({
    title: "Two Sum",
    description: "Return indices of the two numbers such that they add up to a specific target.",
    example_input: "nums = [2,7,11,15], target = 9",
    example_output: "[0,1]"
  });
  const [answer, setAnswer] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUploadMessage, setResumeUploadMessage] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

useEffect(() => {
  const fetchQuestion = async () => {
    if (questionType === "technical") {
      try {
        const token = localStorage.getItem("access");
        const res = await fetch("http://localhost:8000/api/generate-question/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.ok) {
          setQuestion({
            title: data.title || "Untitled",
            description: data.problem,
            example_input: data.test_cases?.[0]?.input || "",
            example_output: data.test_cases?.[0]?.output || "",
          });
        } else {
          console.error("Error fetching question:", data.error || "Unknown error");
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    } else {
      setQuestion({
        title: "",
        description: "",
        example_input: "",
        example_output: ""
      });
    }

    setAnswer("");
    setFeedback("");
  };

  fetchQuestion();
}, [questionType]);

  const handleAnswerChange = (value: string | undefined) => {
    setAnswer(value || "");
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
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
        // You could now send this to your LLM to generate behavioral questions.
      } else {
        setResumeUploadMessage(`❌ Failed to upload resume: ${data.error || "Unknown error"}`);
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
      <div className="mb-3 w-100 d-flex justify-content-start">
        <select
          value={questionType}
          onChange={(e) => setQuestionType(e.target.value as "technical" | "behavioral")}
          className="form-select w-auto"
        >
          <option value="technical">🧠 Technical</option>
          <option value="behavioral">💬 Behavioral</option>
        </select>
      </div>

      <Row>
        {/* Left Side */}
        <Col md={6} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              {questionType === "technical" ? (
                <>
                  <Card.Title className="fw-bold">🤖 {question.title}</Card.Title>
                  <Card.Text>{question.description}</Card.Text>

                  {question.example_input && (
                    <>
                      <h6 className="text-muted">📥 Example Input</h6>
                      <pre className="bg-light border rounded p-2">{question.example_input}</pre>
                    </>
                  )}
                  {question.example_output && (
                    <>
                      <h6 className="text-muted mt-2">📤 Example Output</h6>
                      <pre className="bg-light border rounded p-2">{question.example_output}</pre>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Card.Title className="fw-bold">💬 Behavioral Interview</Card.Title>
                  <p className="text-muted">
                    AI will generate your behavioral question. Please answer using the STAR format.
                  </p>

                  <div className="mt-3">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setResumeFile(file);
                        if (file) handleResumeUpload(file);
                      }}
                      style={{ display: "none" }}
                      ref={fileInputRef}
                    />
                    <Button variant="outline-secondary" onClick={() => fileInputRef.current?.click()}>
                      📄 Upload Resume
                    </Button>
                    {resumeFile && (
                      <div className="mt-2 text-muted small">
                        ✅ Uploaded: <strong>{resumeFile.name}</strong>
                      </div>
                    )}
                    {resumeUploadMessage && (
                      <Alert className="mt-2" variant={resumeUploadMessage.startsWith("✅") ? "success" : "danger"}>
                        {resumeUploadMessage}
                      </Alert>
                    )}
                  </div>

                  <textarea
                    rows={6}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="form-control mt-3"
                    placeholder="Use STAR format..."
                  />
                  <Button
                    className="mt-3"
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={!answer || loading}
                  >
                    {loading ? "Submitting..." : "Submit Answer"}
                  </Button>
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

        {/* Right Side */}
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
                <Button variant="success" onClick={handleSubmit} disabled={!answer || loading}>
                  {loading ? "Evaluating..." : "Submit"}
                </Button>
              </div>
            </>
          ) : (
            <Card>
              <Card.Body>
                <h5>Video Interview</h5>
                <video ref={videoRef} autoPlay muted className="w-100 h-64 bg-dark rounded shadow-sm" />
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
        </Col>
      </Row>
    </Container>
  );
};

export default MockInterview;
