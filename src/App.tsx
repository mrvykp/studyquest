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
import QuizResultPage from "./pages/QuizResultPage";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pages with Header and Sider */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/subjects" replace />} />

          <Route path="/subjects" element={<SubjectsPage />} />

          <Route path="/subjects/:subjectId" element={<SubjectDetailsPage />} />

          <Route path="/questions" element={<QuestionsPage />} />

          <Route path="/practice" element={<PracticeSetupPage />} />

          <Route path="/practice/activity" element={<PracticeActivityPage />} />

          <Route
            path="/practice/:sessionId"
            element={<PracticeSessionPage />}
          />

          <Route path="/quizzes/new" element={<QuizBuilderPage />} />
        </Route>

        {/* Focused pages without the Header and Sider */}
        <Route path="/quizzes/play" element={<QuizPlayerPage />} />

        <Route
          path="/quizzes/results/:attemptId"
          element={<QuizResultPage />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
