import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { getSessionId } from "@/lib/session";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts";

interface ResponseData {
  sql?: string;
  answer?: string;
  data?: Record<string, any>[];
  chart?: {
    type: "bar" | "line" | "pie";
    x: string;
    y: string;
  };
  error?: string;
}

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#a4de6c",
  "#d0ed57",
];
function DynamicChart({ data, chart }: { data: any[]; chart: any }) {
  if (!data || !chart) return null;

  const { type, x, y } = chart;

  switch (type) {
    case "bar":
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={x} />
            <YAxis />
            <Tooltip />
            <Bar dataKey={y} fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      );
    case "line":
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={x} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey={y} stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      );
    case "Pie Chart":
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey={y}
              nameKey={x}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      );
    case "scatter":
      return (
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="category"
              dataKey={x}
              name={x}
              label={{ value: x, position: "insideBottom", offset: -5 }}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              type="number"
              dataKey={y}
              name={y}
              label={{ value: y, angle: -90, position: "insideLeft" }}
            />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Scatter name="Data Points" data={data} fill="#8884d8" />
          </ScatterChart>
        </ResponsiveContainer>
      );

    default:
      return <p>Unsupported chart type: {type}</p>;
  }
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
      // console.log(res.data);
    } catch (err: any) {
      if (err.response.status === 440) {
        localStorage.removeItem("sessionId");
        alert("Your session has expired. Please reconnect your database.");
        navigate("/");
      }
      // console.error("API error:", err);
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
            {response.chart && response.data && (
              <div>
                <p className="text-muted-foreground">Visual Representation:</p>
                <div className="bg-muted rounded p-4">
                  <DynamicChart data={response.data} chart={response.chart} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
