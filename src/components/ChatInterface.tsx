import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { getSessionId } from "@/lib/session";
import { useNavigate } from "react-router-dom";

interface ResponseData {
  sql?: string;
  answer?: string;
  data?: Record<string, any>[];
  error?: string;
}

export default function ChatInterface() {
  const [question, setQuestion] = useState<string>("");
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const sessionId = getSessionId();
  // console.log(sessionId);
  const navigate = useNavigate();

  const askQuestion = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setResponse(null);

    try {
      const res = await axios.post<ResponseData>("http://localhost:5000/ask", {
        question,
        sessionId,
      });

      setResponse(res.data);
      console.log(res.data);
    } catch (err: any) {
      if (err.response.status === 440) {
        localStorage.removeItem("sessionId");
        alert("Your session has expired. Please reconnect your database.");
        navigate("/");
      }
      console.error("API error:", err);
      setResponse({
        error: err.response?.data?.error || "An unknown error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") askQuestion();
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ask a question like: Top 3 products sold last month"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button onClick={askQuestion} disabled={loading}>
              {loading ? "Loading..." : "Ask"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {response && (
        <Card>
          <CardContent className="p-4 space-y-3 text-sm">
            {response.error && (
              <p className="text-red-500 font-semibold">
                Error: {response.error}
              </p>
            )}

            {response.sql && (
              <div>
                <p className="text-muted-foreground">Generated SQL:</p>
                <pre className="bg-muted p-2 rounded text-xs">
                  {response.sql}
                </pre>
              </div>
            )}

            {response.answer && (
              <div>
                <p className="text-muted-foreground">AI Explanation:</p>
                <p className="bg-muted p-2 rounded text-[0.9rem]">
                  {response.answer}
                </p>
              </div>
            )}

            {response.data && (
              <div>
                <p className="text-muted-foreground">Query Result:</p>
                <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                  {JSON.stringify(response.data, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
