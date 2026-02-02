import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { UploadPage } from './pages/UploadPage';
import { ResultsPage } from './pages/ResultsPage';
import { ToastProvider } from './components/Toast';

import Preloader from './components/Preloader';

/**
 * RenderX App - Real-Time Distributed Video Rendering Platform
 */
function App() {
    const [loading, setLoading] = useState(true);
    const [jobId, setJobId] = useState(null);
    const [results, setResults] = useState(null);
    const [analytics, setAnalytics] = useState(null);

    const handleJobCreated = (id, data, analyticsData) => {
        setJobId(id);
        setResults(data);
        if (analyticsData) setAnalytics(analyticsData);
    };

    const handleAnalytics = (data) => {
        setAnalytics(data);
    };

    return (
        <BrowserRouter>
            <ToastProvider>
                <div className="min-h-screen bg-[#0B0E14]">
                    <AnimatePresence mode="wait">
                        {loading && <Preloader key="preloader" onComplete={() => setLoading(false)} />}
                    </AnimatePresence>



                    <Navbar />

                    <main>
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route
                                path="/upload"
                                element={
                                    <UploadPage
                                        onJobCreated={handleJobCreated}
                                        onAnalytics={handleAnalytics}
                                    />
                                }
                            />
                            <Route
                                path="/results"
                                element={
                                    <ResultsPage
                                        jobId={jobId}
                                        results={results}
                                        analytics={analytics}
                                    />
                                }
                            />
                        </Routes>
                    </main>

                    {/* Footer */}
                    <footer className="border-t border-[#1F2433] py-8 mt-16 relative z-50">
                        <div className="container-app text-center">
                            <p className="text-sm text-[#6B7280]">
                                Built with React • FastAPI • Python Multiprocessing • OpenCV
                            </p>
                            <p className="text-xs text-[#4B5563] mt-2">
                                © 2026 RenderX. Demonstrating parallel video processing.
                            </p>
                        </div>
                    </footer>
                </div>
            </ToastProvider>
        </BrowserRouter>
    );
}

export default App;
