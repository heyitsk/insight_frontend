import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getSessionId } from "@/lib/session";

interface DbCredentials {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

interface ResponseData {
  success: boolean;
  message: string;
}

export default function ConnectDbForm() {
  const [form, setForm] = useState<DbCredentials>({
    host: "",
    port: 5432,
    user: "",
    password: "",
    database: "",
  });
  const navigate = useNavigate();
  const sessionId = getSessionId();

  const [response, setResponse] = useState<ResponseData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "port" ? Number(value) : value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setResponse(null);

    try {
      const res = await axios.post("http://localhost:5000/connect-db", {
        ...form,
        sessionId,
      });

      //   console.log(res.data);

      setResponse({ success: true, message: "Connection successfull" });
      if (res.data.success) {
        setTimeout(() => {
          navigate("/chat");
        }, 500);
      }
    } catch (err) {
      setResponse({ success: false, message: "Connection failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-6 space-y-4">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <h2 className="text-xl font-semibold">Connect to your database</h2>

          {["host", "port", "user", "password", "database"].map((field) => (
            <div key={field} className="space-y-1">
              <Label htmlFor={field}>{field.toUpperCase()}</Label>
              <Input
                id={field}
                name={field}
                type={field === "password" ? "password" : "text"}
                value={form[field as keyof DbCredentials] as string | number}
                onChange={handleChange}
              />
            </div>
          ))}

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Connecting..." : "Connect"}
          </Button>

          {response && (
            <p
              className={`font-medium ${
                response.success ? "text-green-600" : "text-red-600"
              }`}
            >
              {response.message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
