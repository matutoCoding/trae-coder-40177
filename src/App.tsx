import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import ReminderList from "@/pages/ReminderList";
import MemberDetail from "@/pages/MemberDetail";
import Statistics from "@/pages/Statistics";

export default function App() {
  return (
    <Router>
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<ReminderList />} />
            <Route path="/member/:id" element={<MemberDetail />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/members" element={<ReminderList />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
