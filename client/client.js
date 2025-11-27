import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCcw, User, Zap, List, Plus, LogOut, Send, CheckCircle, XCircle } from 'lucide-react';

// --- Mock API Data and Functions (Simulating Node.js Server) ---
// In a real app, replace these with actual 'fetch' calls to your server.js API.

const MOCK_QUIZZES = [
  { id: 'q1', title: 'The World of React', description: 'A quick test on hooks and components.', questions: [
    { id: 'q1-1', questionType: 'MCQ', text: 'What hook manages state in a functional component?', options: ['useEffect', 'useState', 'useContext'], correctAnswer: 1 },
    { id: 'q1-2', questionType: 'TrueFalse', text: 'JSX is mandatory for writing React applications.', correctAnswer: 'False' },
    { id: 'q1-3', questionType: 'Text', text: 'What is the package manager commonly used with Node.js?', correctAnswer: 'npm' }
  ]},
  { id: 'q2', title: 'MongoDB & Mongoose Basics', description: 'Testing your backend database knowledge.', questions: [
    { id: 'q2-1', questionType: 'MCQ', text: 'Which structure does MongoDB use to store data?', options: ['Tables', 'Documents', 'Rows'], correctAnswer: 1 },
    { id: 'q2-2', questionType: 'TrueFalse', text: 'Mongoose is an ORM for MongoDB.', correctAnswer: 'True' }
  ]}
];

const MOCK_USERS = [
  { id: 'u1', name: 'Admin User', email: 'admin@app.com', role: 'admin' },
  { id: 'u2', name: 'Standard Taker', email: 'taker@app.com', role: 'user' }
];

const mockApi = {
  login: async (email, password) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = MOCK_USERS.find(u => u.email === email && password === 'password'); // Mocked password
    if (user) {
      return { token: 'mock-jwt-token', user };
    }
    throw new Error('Invalid credentials');
  },
  getQuizzes: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_QUIZZES.map(q => ({ id: q.id, title: q.title, description: q.description }));
  },
  getQuizById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const quiz = MOCK_QUIZZES.find(q => q.id === id);
    if (!quiz) throw new Error('Quiz not found');
    // Return quiz without correct answers for public view
    return { ...quiz, questions: quiz.questions.map(q => ({ ...q, correctAnswer: undefined })) };
  },
  submitQuiz: async (id, submission) => {
    await new Promise(resolve => setTimeout(resolve, 800));

    const quiz = MOCK_QUIZZES.find(q => q.id === id);
    if (!quiz) throw new Error('Quiz not found');

    let score = 0;
    let maxScore = 0;

    quiz.questions.forEach((q, index) => {
        const submittedAnswer = submission.answers[index];
        const points = 1; // Simplify points for mock
        maxScore += points;

        if (q.questionType === 'MCQ' && submittedAnswer === q.correctAnswer) {
            score += points;
        } else if (q.questionType === 'TrueFalse' && String(submittedAnswer) === String(q.correctAnswer)) {
            score += points;
        } else if (q.questionType === 'Text' && String(submittedAnswer).toLowerCase().trim() === String(q.correctAnswer).toLowerCase().trim()) {
            score += points;
        }
    });

    return { score, maxScore };
  },
  createUser: async (userData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newUser = { id: `u${MOCK_USERS.length + 1}`, ...userData, password: 'sent-via-email' };
    MOCK_USERS.push(newUser);
    // In a real app: Send email logic here (as in server.js)
    return { ...newUser, message: `User created. Password sent to ${userData.email} (mocked).` };
  },
  createQuiz: async (quizData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newQuiz = { id: `q${MOCK_QUIZZES.length + 1}`, ...quizData };
    MOCK_QUIZZES.push(newQuiz);
    return newQuiz;
  }
};

// --- Question Components ---

const QuestionMCQ = ({ question, index, answer, setAnswer }) => (
    <div className="space-y-2">
        <p className="font-semibold text-gray-700">{index + 1}. {question.text}</p>
        <div className="space-y-1">
            {question.options.map((option, optIndex) => (
                <label key={optIndex} className="flex items-center p-2 bg-white rounded-lg shadow-sm hover:bg-indigo-50 transition duration-150 cursor-pointer">
                    <input
                        type="radio"
                        name={`q-${question.id}`}
                        checked={answer === optIndex}
                        onChange={() => setAnswer(optIndex)}
                        className="form-radio h-4 w-4 text-indigo-600 border-gray-300"
                    />
                    <span className="ml-3 text-sm text-gray-700">{option}</span>
                </label>
            ))}
        </div>
    </div>
);

const QuestionTrueFalse = ({ question, index, answer, setAnswer }) => (
    <div className="space-y-2">
        <p className="font-semibold text-gray-700">{index + 1}. {question.text}</p>
        <div className="flex space-x-4">
            {['True', 'False'].map(option => (
                <label key={option} className="flex items-center p-2 bg-white rounded-lg shadow-sm hover:bg-indigo-50 transition duration-150 cursor-pointer w-24 justify-center">
                    <input
                        type="radio"
                        name={`q-${question.id}`}
                        checked={answer === option}
                        onChange={() => setAnswer(option)}
                        className="form-radio h-4 w-4 text-indigo-600 border-gray-300"
                    />
                    <span className="ml-3 text-sm text-gray-700">{option}</span>
                </label>
            ))}
        </div>
    </div>
);

const QuestionText = ({ question, index, answer, setAnswer }) => (
    <div className="space-y-2">
        <p className="font-semibold text-gray-700">{index + 1}. {question.text}</p>
        <input
            type="text"
            value={answer || ''}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
        />
    </div>
);


// --- Pages/Views ---

export const LoginPage = ({ setAuth }) => {
    const [email, setEmail] = useState('admin@app.com');
    const [password, setPassword] = useState('password');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await mockApi.login(email, password);
            setAuth(response.user);
        } catch (err) {
            setError(err.message || 'Login failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="p-8 bg-white rounded-xl shadow-2xl w-full max-w-sm space-y-6">
                <h2 className="text-3xl font-extrabold text-gray-900 text-center">Admin Login</h2>
                {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
                
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="admin@app.com"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="password"
                    />
                </div>
                
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 disabled:bg-indigo-400"
                >
                    {loading ? (
                        <>
                            <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                            Signing In...
                        </>
                    ) : 'Sign In'}
                </button>
                <div className="text-center text-sm text-gray-500 pt-2">
                    <p>Default: admin@app.com / password</p>
                </div>
            </form>
        </div>
    );
};

export const QuizCreator = ({ setCurrentPage, reloadQuizzes }) => {
    const initialQuestion = { questionType: 'MCQ', text: '', options: ['', '', ''], correctAnswer: 0 };
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState([initialQuestion]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        setQuestions(newQuestions);
    };

    const addQuestion = (type) => {
        let newQuestion = { text: '', points: 1 };
        if (type === 'MCQ') {
            newQuestion = { ...newQuestion, questionType: 'MCQ', options: ['', '', ''], correctAnswer: 0 };
        } else if (type === 'TrueFalse') {
            newQuestion = { ...newQuestion, questionType: 'TrueFalse', correctAnswer: 'True' };
        } else if (type === 'Text') {
            newQuestion = { ...newQuestion, questionType: 'Text', correctAnswer: '' };
        }
        setQuestions([...questions, newQuestion]);
    };

    const removeQuestion = (index) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            const newQuiz = await mockApi.createQuiz({ title, description, questions });
            setMessage(`Quiz "${newQuiz.title}" created successfully!`);
            setTitle('');
            setDescription('');
            setQuestions([initialQuestion]);
            reloadQuizzes(); // Refresh the list in Admin dashboard
            setTimeout(() => setCurrentPage('admin'), 1500);
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 border-b pb-3 mb-4 flex items-center">
                <Plus className="w-6 h-6 mr-3 text-indigo-600" />
                Create New Quiz
            </h2>

            {message && (
                <div className={`p-4 rounded-lg text-sm ${message.startsWith('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Quiz Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Quiz Title</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows="1" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"></textarea>
                    </div>
                </div>

                {/* Questions */}
                <h3 className="text-xl font-semibold text-gray-800 mt-8">Questions ({questions.length})</h3>
                <div className="space-y-8">
                    {questions.map((q, index) => (
                        <div key={index} className="p-6 border border-indigo-200 bg-white rounded-xl shadow-md space-y-4 relative">
                            <h4 className="text-lg font-bold text-indigo-700">Question {index + 1}</h4>
                            <button type="button" onClick={() => removeQuestion(index)} className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition">
                                <XCircle className="w-5 h-5" />
                            </button>

                            {/* Question Text */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Question Text</label>
                                <textarea value={q.text} onChange={e => handleQuestionChange(index, 'text', e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"></textarea>
                            </div>
                            
                            {/* Question Type Selector */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Question Type</label>
                                <select value={q.questionType} onChange={e => handleQuestionChange(index, 'questionType', e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    <option value="MCQ">Multiple Choice (MCQ)</option>
                                    <option value="TrueFalse">True/False</option>
                                    <option value="Text">Short Answer (Text)</option>
                                </select>
                            </div>

                            {/* Type Specific Inputs */}
                            {q.questionType === 'MCQ' && (
                                <div className="space-y-3 p-3 bg-indigo-50 rounded-lg">
                                    <h5 className="font-semibold text-indigo-700">Options & Correct Answer</h5>
                                    {q.options.map((option, optIndex) => (
                                        <div key={optIndex} className="flex items-center space-x-3">
                                            <input
                                                type="radio"
                                                name={`correctAnswer-${index}`}
                                                checked={q.correctAnswer === optIndex}
                                                onChange={() => handleQuestionChange(index, 'correctAnswer', optIndex)}
                                                className="form-radio h-4 w-4 text-green-600 border-gray-300"
                                            />
                                            <input
                                                type="text"
                                                value={option}
                                                onChange={e => {
                                                    const newOptions = [...q.options];
                                                    newOptions[optIndex] = e.target.value;
                                                    handleQuestionChange(index, 'options', newOptions);
                                                }}
                                                required
                                                placeholder={`Option ${optIndex + 1}`}
                                                className="block w-full px-3 py-1 border border-gray-300 rounded-lg text-sm"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {q.questionType === 'TrueFalse' && (
                                <div className="space-y-3 p-3 bg-indigo-50 rounded-lg">
                                    <h5 className="font-semibold text-indigo-700">Correct Answer</h5>
                                    <div className="flex space-x-4">
                                        <label className="flex items-center">
                                            <input type="radio" name={`tf-correctAnswer-${index}`} checked={q.correctAnswer === 'True'} onChange={() => handleQuestionChange(index, 'correctAnswer', 'True')} className="form-radio h-4 w-4 text-green-600" />
                                            <span className="ml-2">True</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input type="radio" name={`tf-correctAnswer-${index}`} checked={q.correctAnswer === 'False'} onChange={() => handleQuestionChange(index, 'correctAnswer', 'False')} className="form-radio h-4 w-4 text-green-600" />
                                            <span className="ml-2">False</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {q.questionType === 'Text' && (
                                <div className="space-y-3 p-3 bg-indigo-50 rounded-lg">
                                    <h5 className="font-semibold text-indigo-700">Correct Answer (Exact Match Required)</h5>
                                    <input type="text" value={q.correctAnswer} onChange={e => handleQuestionChange(index, 'correctAnswer', e.target.value)} required placeholder="Enter the exact correct answer" className="block w-full px-3 py-1 border border-gray-300 rounded-lg text-sm" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Add Question Buttons */}
                <div className="flex justify-center space-x-4 pt-4 border-t border-gray-200">
                    <button type="button" onClick={() => addQuestion('MCQ')} className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition">
                        <Plus className="w-4 h-4 mr-2" /> Add MCQ
                    </button>
                    <button type="button" onClick={() => addQuestion('TrueFalse')} className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition">
                        <Plus className="w-4 h-4 mr-2" /> Add True/False
                    </button>
                    <button type="button" onClick={() => addQuestion('Text')} className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition">
                        <Plus className="w-4 h-4 mr-2" /> Add Text
                    </button>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading || questions.length === 0}
                    className="w-full flex justify-center items-center py-3 px-4 rounded-lg shadow-lg text-lg font-semibold text-white bg-green-600 hover:bg-green-700 transition duration-150 disabled:bg-green-400"
                >
                    {loading ? (
                        <>
                            <RefreshCcw className="h-5 w-5 mr-2 animate-spin" />
                            Saving Quiz...
                        </>
                    ) : 'Save Quiz'}
                </button>
            </form>
        </div>
    );
};

const UserManagement = () => {
    const [users, setUsers] = useState(MOCK_USERS);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('user');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            const newUser = await mockApi.createUser({ email, name, role });
            setUsers([...users, newUser]);
            setMessage(newUser.message);
            setEmail('');
            setName('');
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Note: In a real app, you'd fetch the user list here.

    return (
        <div className="space-y-8">
            {/* Create New User Form */}
            <div className="p-6 bg-indigo-50 rounded-xl shadow-md">
                <h3 className="text-xl font-bold text-indigo-700 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2" /> Create New User Login
                </h3>
                {message && (
                    <div className={`p-3 mb-4 rounded-lg text-sm ${message.startsWith('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {message}
                    </div>
                )}
                <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Full Name" className="col-span-1 px-3 py-2 border rounded-lg" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Email (will receive password)" className="col-span-1 px-3 py-2 border rounded-lg" />
                    <select value={role} onChange={e => setRole(e.target.value)} className="col-span-1 px-3 py-2 border rounded-lg">
                        <option value="user">User/Taker</option>
                        <option value="admin">Admin</option>
                    </select>
                    <button type="submit" disabled={loading} className="col-span-1 flex justify-center items-center py-2 px-4 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:bg-indigo-400">
                        {loading ? 'Creating...' : (
                            <>
                                <Send className="w-4 h-4 mr-2" /> Send Login
                            </>
                        )}
                    </button>
                </form>
                <p className="text-xs text-gray-500 mt-2">A temporary login password will be generated and sent to this email (simulated).</p>
            </div>

            {/* User List */}
            <div className="p-6 bg-white rounded-xl shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Existing Users</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-pink-100 text-pink-800' : 'bg-green-100 text-green-800'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export const AdminDashboard = ({ setAuth, setCurrentPage, auth, quizzes }) => {
    return (
        <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
            <header className="flex justify-between items-center mb-10 pb-4 border-b">
                <h1 className="text-4xl font-extrabold text-indigo-700">Admin Dashboard</h1>
                <div className="flex items-center space-x-4">
                    <p className="text-gray-600 text-sm font-medium">Logged in as: {auth.email}</p>
                    <button onClick={() => setAuth(null)} className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
                        <LogOut className="w-4 h-4 mr-2" /> Logout
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Panel 1: User Management */}
                <div className="lg:col-span-3">
                    <UserManagement />
                </div>

                {/* Panel 2: Quiz Management */}
                <div className="lg:col-span-3 p-6 bg-white rounded-xl shadow-lg">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                        <List className="w-6 h-6 mr-3 text-indigo-600" />
                        Manage Quizzes
                    </h2>

                    <button
                        onClick={() => setCurrentPage('createQuiz')}
                        className="mb-6 flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition"
                    >
                        <Plus className="w-5 h-5 mr-2" /> Create New Quiz
                    </button>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {quizzes.map(quiz => (
                                    <tr key={quiz.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{quiz.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {MOCK_QUIZZES.find(q => q.id === quiz.id)?.questions.length || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {/* In a real app, add Edit/Delete functionality here */}
                                            <span className="text-indigo-600 hover:text-indigo-900 cursor-pointer">Edit</span> | <span className="text-red-600 hover:text-red-900 cursor-pointer">Delete</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const PublicQuizList = ({ setCurrentPage, setQuizId }) => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchQuizzes = useCallback(async () => {
        setLoading(true);
        try {
            const data = await mockApi.getQuizzes();
            setQuizzes(data);
        } catch (error) {
            console.error('Error fetching quizzes:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchQuizzes();
    }, [fetchQuizzes]);

    if (loading) return <div className="text-center p-20 text-indigo-600">Loading quizzes...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-6 sm:p-10">
            <header className="text-center mb-10">
                <h1 className="text-5xl font-extrabold text-gray-900 mb-2">Quiz Hub</h1>
                <p className="text-xl text-gray-600">Test your knowledge on various topics!</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {quizzes.length > 0 ? (
                    quizzes.map(quiz => (
                        <div key={quiz.id} className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-indigo-500 transition duration-300 hover:shadow-xl hover:scale-[1.02]">
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">{quiz.title}</h3>
                            <p className="text-gray-500 mb-4">{quiz.description}</p>
                            <button
                                onClick={() => { setQuizId(quiz.id); setCurrentPage('takeQuiz'); }}
                                className="w-full flex items-center justify-center py-2 px-4 rounded-lg text-white font-semibold bg-indigo-600 hover:bg-indigo-700 transition"
                            >
                                <Zap className="w-4 h-4 mr-2" /> Start Quiz
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="md:col-span-3 text-center p-10 bg-white rounded-xl shadow-lg">No quizzes available yet. Check back soon!</div>
                )}
            </div>
            <div className="mt-10 text-center">
                 <button onClick={() => setCurrentPage('login')} className="text-sm text-gray-500 hover:text-indigo-600 transition">
                    Admin Login
                </button>
            </div>
        </div>
    );
};

export const QuizTaker = ({ quizId, setCurrentPage }) => {
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [takerDetails, setTakerDetails] = useState({ name: '', email: '' });

    useEffect(() => {
        setLoading(true);
        mockApi.getQuizById(quizId).then(data => {
            setQuiz(data);
            setAnswers(new Array(data.questions.length).fill(null));
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, [quizId]);

    const handleAnswerChange = (index, answer) => {
        const newAnswers = [...answers];
        newAnswers[index] = answer;
        setAnswers(newAnswers);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const submission = {
                takerName: takerDetails.name,
                takerEmail: takerDetails.email,
                answers: answers
            };
            const res = await mockApi.submitQuiz(quizId, submission);
            setResult(res);
        } catch (error) {
            console.error('Submission failed:', error);
            alert('Failed to submit quiz.'); // Using a custom message box is better, but simplified here.
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center p-20 text-indigo-600">Loading quiz content...</div>;
    if (!quiz) return <div className="text-center p-20 text-red-600">Quiz not found.</div>;

    if (result) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
                <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl p-8 text-center space-y-6">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                    <h2 className="text-3xl font-bold text-gray-800">Quiz Completed!</h2>
                    <p className="text-xl font-semibold text-indigo-600">Your Score: {result.score} out of {result.maxScore}</p>
                    <p className="text-gray-600">Thank you for taking the "{quiz.title}".</p>
                    <button
                        onClick={() => setCurrentPage('home')}
                        className="w-full py-3 px-4 rounded-lg text-white font-semibold bg-indigo-600 hover:bg-indigo-700 transition"
                    >
                        Go to Quiz List
                    </button>
                </div>
            </div>
        );
    }

    const allAnswered = answers.every(answer => answer !== null && answer !== '');

    return (
        <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{quiz.title}</h1>
            <p className="text-xl text-gray-600 mb-8">{quiz.description}</p>

            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
                {/* Taker Details */}
                <div className="p-5 bg-indigo-50 rounded-xl shadow-inner grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        value={takerDetails.name}
                        onChange={e => setTakerDetails({ ...takerDetails, name: e.target.value })}
                        required
                        placeholder="Your Full Name"
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <input
                        type="email"
                        value={takerDetails.email}
                        onChange={e => setTakerDetails({ ...takerDetails, email: e.target.value })}
                        required
                        placeholder="Your Email"
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                
                {/* Questions */}
                <div className="space-y-6">
                    {quiz.questions.map((q, index) => {
                        const commonProps = {
                            key: q.id,
                            question: q,
                            index: index,
                            answer: answers[index],
                            setAnswer: (val) => handleAnswerChange(index, val)
                        };

                        switch (q.questionType) {
                            case 'MCQ': return <QuestionMCQ {...commonProps} />;
                            case 'TrueFalse': return <QuestionTrueFalse {...commonProps} />;
                            case 'Text': return <QuestionText {...commonProps} />;
                            default: return null;
                        }
                    })}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={submitting || !allAnswered}
                    className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-lg text-xl font-bold text-white bg-green-600 hover:bg-green-700 transition duration-150 disabled:bg-green-400"
                >
                    {submitting ? (
                        <>
                            <RefreshCcw className="h-5 w-5 mr-2 animate-spin" />
                            Submitting...
                        </>
                    ) : 'Submit Quiz & Get Score'}
                </button>
            </form>
            <div className="mt-8 text-center">
                 <button onClick={() => setCurrentPage('home')} className="text-sm text-gray-500 hover:text-red-600 transition">
                    Cancel and Return to Home
                </button>
            </div>
        </div>
    );
};

