import { useMonitor } from './components/hooks/useMonitor';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Report } from './pages/Report';
import { Diagnostics } from './pages/Diagnostics';
import { Settings } from './pages/Settings';
import { Calibration } from './pages/Calibration';
import { useState, useEffect } from 'react';

function App() {
  const [currentPage, setCurrentPage] = useState('system');
  const [uptime, setUptime] = useState(0);
  const { state: monitorState, isConnected } = useMonitor();

  useEffect(() => {
    const t = setInterval(() => setUptime(prev => prev + 0.1), 100);
    return () => clearInterval(t);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'system':
        return <Dashboard monitorState={monitorState} isConnected={isConnected} uptime={uptime} />;
      case 'telemetry':
        return <Report uptime={uptime} />;
      case 'diagnostics':
        return <Diagnostics />;
      case 'calibration':
        return <Calibration onComplete={() => setCurrentPage('system')} />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard monitorState={monitorState} isConnected={isConnected} uptime={uptime} />;
    }
  };

  return (
    <Layout
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      isConnected={isConnected}
      uptime={uptime}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;
