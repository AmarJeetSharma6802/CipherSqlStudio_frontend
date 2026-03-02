import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AssignmentList.scss';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Assignment {
  _id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export default function AssignmentList() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_URL}/api/assignments`)
      .then((res) => {
        setAssignments(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching assignments:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="assignment-list-page">
      <header className="page-header">
        <h1>SQL Assignments</h1>
        <p>Select an assignment to practice your SQL skills.</p>
      </header>

      {loading ? (
        <div className="loading">Loading assignments...</div>
      ) : (
        <div className="assignments-grid">
          {assignments.map((assignment) => (
            <div key={assignment._id} className="assignment-card">
              <div className="card-header">
                <h2>{assignment.title}</h2>
                <span className={`difficulty ${assignment.difficulty.toLowerCase()}`}>
                  {assignment.difficulty}
                </span>
              </div>
              <p className="description">{assignment.description}</p>
              <button 
                className="btn-attempt"
                onClick={() => navigate(`/attempt/${assignment._id}`)}
              >
                Attempt Challenge
              </button>
            </div>
          ))}
          {assignments.length === 0 && (
            <div className="no-assignments">
              <p>No assignments available at the moment.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
