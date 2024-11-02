import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/admin/patients', icon: '👥', label: 'Pacientes' },
    { path: '/admin/appointments', icon: '📅', label: 'Consultas' },
    { path: '/admin/questionnaires', icon: '📝', label: 'Questionários' },
    { path: '/admin/calendar', icon: '📆', label: 'Calendário' },
    { path: '/admin/financial', icon: '💰', label: 'Financeiro' },
  ];

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">Clínica de Acupuntura</h2>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center p-2 rounded-lg hover:bg-gray-700 ${
                  location.pathname === item.path ? 'bg-gray-700' : ''
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="flex items-center w-full p-2 rounded-lg hover:bg-gray-700"
        >
          <span className="mr-3">🚪</span>
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
}