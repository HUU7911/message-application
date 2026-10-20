import { useAuth } from './context/AuthContext';
import { ChatPage } from './pages/ChatPage';
import { LoginPage } from './pages/LoginPage';

export default function App() {
  const { user, token, loading } = useAuth();

  if (loading) return <div className="splash">Đang tải…</div>;
  if (!user || !token) return <LoginPage />;
  return <ChatPage key={user.id} token={token} me={user} />;
}
