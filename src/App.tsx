import { ThemeProvider } from "@/components/ui/theme-provider";
import { ModeToggle } from "./components/ui/mode-toggle";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ConnectDbForm from "./components/ConnectDbForm";
import ChatInterface from "./components/ChatInterface";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <main className="min-h-screen p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">InsightIQ</h1>
            <ModeToggle />
          </div>

          <Routes>
            <Route path="/" element={<ConnectDbForm />} />
            <Route path="/chat" element={<ChatInterface />} />
          </Routes>
        </main>
      </Router>
    </ThemeProvider>
  );
}

export default App;
