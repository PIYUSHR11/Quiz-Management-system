const App = () => {
    // Simple state management for routing
    const [currentPage, setCurrentPage] = useState('home'); // 'home', 'login', 'admin', 'createQuiz', 'takeQuiz'
    const [quizId, setQuizId] = useState(null); // ID of the quiz being taken
    // auth now stores the token as well
    const [auth, setAuth] = useState(null); // { id: 'u1', role: 'admin', email: 'admin@app.com', token: '...' }
    const [quizzes, setQuizzes] = useState([]);

    const fetchAllQuizzes = useCallback(async () => {
        try {
            const data = await mockApi.getQuizzes();
            setQuizzes(data);
        } catch (error) {
            console.error('Failed to fetch quizzes for admin:', error);
        }
    }, []);

    useEffect(() => {
        fetchAllQuizzes();
    }, [fetchAllQuizzes]);

    const handleSetCurrentPage = (page) => {
        setCurrentPage(page);
        if (page === 'admin') {
            fetchAllQuizzes();
        }
    }

    let content;

    if (auth?.role === 'admin') {
        if (currentPage === 'createQuiz') {
            // Passing the authToken is essential for the QuizCreator to make an authenticated request
            content = <QuizCreator 
                setCurrentPage={handleSetCurrentPage} 
                reloadQuizzes={fetchAllQuizzes} 
                authToken={auth.token} 
            />;
        } else {
            content = <AdminDashboard setAuth={setAuth} setCurrentPage={handleSetCurrentPage} auth={auth} quizzes={quizzes} />;
        }
    } else if (auth) {
        // Simple User Dashboard (if needed later)
        content = <p>User Dashboard - Not implemented yet. Please log out.</p>;
    } else if (currentPage === 'login') {
        content = <LoginPage setAuth={(user) => { setAuth(user); setCurrentPage('admin'); }} />;
    } else if (currentPage === 'takeQuiz' && quizId) {
        content = <QuizTaker quizId={quizId} setCurrentPage={handleSetCurrentPage} />;
    } else {
        content = <PublicQuizList setCurrentPage={handleSetCurrentPage} setQuizId={setQuizId} />;
    }

    return (
        <div className="font-sans min-h-screen">
            {content}
        </div>
    );
};

export default App;