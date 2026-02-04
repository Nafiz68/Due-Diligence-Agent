import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { DocumentsPage } from './pages/DocumentsPage';
import { QuestionnairesPage } from './pages/QuestionnairesPage';
import { ReviewPage } from './pages/ReviewPage';
import { EvaluationPage } from './pages/EvaluationPage';
import { ChatPage } from './pages/ChatPage';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="questionnaires" element={<QuestionnairesPage />} />
          <Route path="review" element={<ReviewPage />} />
          <Route path="evaluation" element={<EvaluationPage />} />
          <Route path="chat" element={<ChatPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

