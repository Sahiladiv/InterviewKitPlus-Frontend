import React, { useEffect, useRef, useState } from "react";
import { Container, Row, Col, Card, Button, Alert } from "react-bootstrap";
import Editor from "@monaco-editor/react";

const MockInterview: React.FC = () => {
  const [questionType, setQuestionType] = useState<"technical" | "behavioral">("technical");
  const [question, setQuestion] = useState<any>({
    title: "",
    description: "",
    example_input: "",
    example_output: "",
    input_format: "",
    output_format: "",
    constraints: ""
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
          const res = await fetch("https://interviewkitplusapi.onrender.com/api/mock/generate-question/", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();
          console.log("Fetched question:", data); // Log the question to the console

          if (res.ok && data?.question) {
            setQuestion({
              title: data.question.title || "Untitled",
              description: data.question.problem || "",
              example_input: data.question.test_cases?.[0]?.input || "",
              example_output: data.question.test_cases?.[0]?.output || "",
              input_format: data.question.input_format || "",
              output_format: data.question.output_format || "",
              constraints: data.question.constraints || ""
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
          example_output: "",
          input_format: "",
          output_format: "",
          constraints: ""
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
        <Col md={6} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              {/* ... rest of component unchanged ... */}
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
