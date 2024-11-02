import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, orderBy, getDocs, where, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    recentAppointments: [],
    upcomingAppointments: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      // Buscar total de pacientes
      const patientsSnapshot = await getDocs(collection(db, 'patients'));
      const totalPatients = patientsSnapshot.size;

      // Buscar consultas do dia
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('date', '>=', today),
        where('date', '<', tomorrow),
        orderBy('date')
      );
      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      const totalAppointments = appointmentsSnapshot.size;

      // Buscar receita total
      const transactionsQuery = query(collection(db, 'transactions'));
      const transactionsSnapshot = await getDocs(transactionsQuery);
      const totalRevenue = transactionsSnapshot.docs.reduce((acc, doc) => {
        const data = doc.data();
        return acc + (data.amount || 0);
      }, 0);

      // Buscar próximas consultas
      const upcomingQuery = query(
        collection(db, 'appointments'),
        where('date', '>=', new Date()),
        orderBy('date'),
        limit(5)
      );
      const upcomingSnapshot = await getDocs(upcomingQuery);
      const upcomingAppointments = upcomingSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setStats({
        totalPatients,
        totalAppointments,
        totalRevenue,
        upcomingAppointments
      });
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    }
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Barra de navegação */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Painel Administrativo</h1>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 mr-4">{currentUser?.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Conteúdo principal */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total de Pacientes
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalPatients}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Consultas Hoje
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalAppointments}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Receita Total
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      R$ {stats.totalRevenue.toFixed(2)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu de ações rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/admin/patients/new"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-medium text-gray-900">Novo Paciente</h3>
            <p className="mt-2 text-sm text-gray-500">
              Cadastrar um novo paciente no sistema
            </p>
          </Link>

          <Link
            to="/admin/appointments/new"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-medium text-gray-900">Nova Consulta</h3>
            <p className="mt-2 text-sm text-gray-500">
              Agendar uma nova consulta
            </p>
          </Link>

          <Link
            to="/admin/financial/new"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-medium text-gray-900">Novo Pagamento</h3>
            <p className="mt-2 text-sm text-gray-500">
              Registrar um novo pagamento
            </p>
          </Link>
        </div>

        {/* Próximas consultas */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">Próximas Consultas</h3>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {stats.upcomingAppointments.map((appointment) => (
                <li key={appointment.id} className="px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {appointment.patientName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(appointment.date.toDate(), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <Link
                      to={`/admin/appointments/${appointment.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Ver detalhes
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}