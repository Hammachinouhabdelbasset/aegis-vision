import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

export const Layout = ({ children, currentPage, setCurrentPage, isConnected, uptime }) => {
  return (
    <div className="w-full h-screen flex flex-col" style={{ background: '#0a0a0f' }}>
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} isConnected={isConnected} />
      <div className="flex flex-1 overflow-hidden" style={{ marginTop: '3rem', marginBottom: '1.5rem' }}>
        <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <main className="flex-1 overflow-y-auto" style={{ marginLeft: '56px' }}>
          {children}
        </main>
      </div>
      <Footer uptime={uptime} isConnected={isConnected} />
    </div>
  );
};
