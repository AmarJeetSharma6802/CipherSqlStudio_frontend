import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import './AssignmentAttempt.scss';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface AssignmentDetails {
  _id: string;
  title: string;
  description: string;
  difficulty: string;
  question: string;
  sampleDataSQL: string;
  schemaSetupSQL: string;
}

interface QueryResult {
  fields: string[];
  rows: any[];
  rowCount: number;
}

export default function AssignmentAttempt() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState<AssignmentDetails | null>(null);
  const [query, setQuery] = useState('-- Write your SQL query here\nSELECT * FROM ...');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isGettingHint, setIsGettingHint] = useState(false);

  useEffect(() => {
    axios.get(`${API_URL}/api/assignments/${id}`)
      .then(res => setAssignment(res.data))
      .catch(err => {
        console.error('Error fetching assignment', err);
        setError('Failed to load assignment.');
      });
  }, [id]);

  const handleExecute = async () => {
    if (!query.trim()) return;
    setIsExecuting(true);
    setError(null);
    setResult(null);

    try {
      const res = await axios.post(`${API_URL}/api/query`, {
        assignmentId: id,
        query
      });
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Execution failed');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleGetHint = async () => {
    if (!query.trim()) {
      setHint('Please write some query attempts first so I can give you a relevant hint!');
      return;
    }
    setIsGettingHint(true);
    setHint(null);
    try {
      const res = await axios.post(`${API_URL}/api/hint`, {
        assignmentId: id,
        userQuery: query
      });
      setHint(res.data.hint);
    } catch (err: any) {
      setHint('Failed to get hint. Please try again.');
    } finally {
      setIsGettingHint(false);
    }
  };

  if (!assignment) return <div className="loading">Loading assignment workspace...</div>;

  return (
    <div className="assignment-attempt-page">
      <header className="attempt-header">
        <button className="btn-back" onClick={() => navigate('/')}>&larr; Back to Assignments</button>
        <h2>{assignment.title}</h2>
        <span className={`difficulty ${assignment.difficulty.toLowerCase()}`}>
          {assignment.difficulty}
        </span>
      </header>

      <div className="workspace-container">

        {/* Left Panel: Context */}
        
        <section className="context-panel">
          <div className="panel-section question-section">
            <h3>Question</h3>
            <p>{assignment.question}</p>
          </div>
          
          <div className="panel-section schema-section">
            <h3>Database Context</h3>
            <div className="code-viewer">
              <pre>
                <code>{assignment.schemaSetupSQL}</code>
                {'\n\n-- Sample Data Insertions --\n'}
                <code>{assignment.sampleDataSQL}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* Right Section Editor*/}

        <section className="editor-panel">
          <div className="editor-container">
            <Editor
              height="300px"
              defaultLanguage="sql"
              theme="vs-dark"
              value={query}
              onChange={(value) => setQuery(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on'
              }}
            />
          </div>

          <div className="actions-bar">
            <button 
              className="btn-primary" 
              onClick={handleExecute} 
              disabled={isExecuting}
            >
              {isExecuting ? 'Executing...' : 'Execute Query'}
            </button>
            <button 
              className="btn-secondary" 
              onClick={handleGetHint}
              disabled={isGettingHint}
            >
              {isGettingHint ? 'Analyzing...' : 'Get AI Hint'}
            </button>
          </div>

          {hint && (
            <div className="hint-box">
              <h4>💡 AI Tutor Hint</h4>
              <p>{hint}</p>
              <button className="close-btn" onClick={() => setHint(null)}>Dismiss</button>
            </div>
          )}

          <div className="results-container">
            <h3>Query Results</h3>
            {error && <div className="error-message">❌ {error}</div>}
            {result && (
              <div className="table-responsive">
                {result.rows.length === 0 ? (
                  <p>Query executed successfully, but returned 0 rows.</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        {result.fields.map((field, idx) => (
                          <th key={idx}>{field}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.rows.map((row, rowIdx) => (
                        <tr key={rowIdx}>
                          {result.fields.map((field, cellIdx) => (
                            <td key={cellIdx}>{row[field]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <div className="row-count">{result.rowCount} row(s) returned</div>
              </div>
            )}
            {!error && !result && <p className="placeholder">Run a query to see results here.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
