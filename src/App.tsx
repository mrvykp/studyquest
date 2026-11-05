import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import SubjectsPage from "./pages/SubjectsPage";
import QuestionsPage from "./pages/QuestionsPage";
import SubjectDetailsPage from "./pages/SubjectDetailsPage";
import PracticeSetupPage from "./pages/PracticeSetupPage";
import PracticeSessionPage from "./pages/PracticeSessionPage";
import PracticeActivityPage from "./pages/PracticeActivityPage";
import QuizBuilderPage from "./pages/QuizBuilderPage";
import QuizPlayerPage from "./pages/QuizPlayerPage";

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/subjects" replace />} />
            <Route path="/subjects" element={<SubjectsPage />} />
            <Route
              path="/subjects/:subjectId"
              element={<SubjectDetailsPage />}
            />
            <Route path="/questions" element={<QuestionsPage />} />
            <Route path="/practice" element={<PracticeSetupPage />} />
            <Route
              path="/practice/activity"
              element={<PracticeActivityPage />}
            />
            <Route
              path="/practice/:sessionId"
              element={<PracticeSessionPage />}
            />
            <Route path="/quizzes/new" element={<QuizBuilderPage />} />
            <Route path="/quizzes/play" element={<QuizPlayerPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
