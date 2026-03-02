import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AssignmentList from './pages/AssignmentList';
import AssignmentAttempt from './pages/AssignmentAttempt';
import './styles/main.scss';

function App() {
  return (
    <div className="App">
      <main className="MainContent">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AssignmentList />} />
            <Route path="/attempt/:id" element={<AssignmentAttempt />} />
          </Routes>
        </BrowserRouter>
      </main>
    </div>
  );
}

export default App;
