import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue'
};

const PAYMENT_METHODS = {
  CASH: 'Dinheiro',
  CREDIT: 'Cartão de Crédito',
  DEBIT: 'Cartão de Débito',
  PIX: 'PIX',
  TRANSFER: 'Transferência'
};

export default function FinancialManagement() {
  const [transactions, setTransactions] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('transactions');
  const [newTransaction, setNewTransaction] = useState({
    patientId: '',
    description: '',
    amount: '',
    paymentMethod: '',
    status: PAYMENT_STATUS.PENDING,
    dueDate: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    fetchFinancialData();
  }, []);

  async function fetchFinancialData() {
    try {
      const transactionsQuery = query(
        collection(db, 'transactions'),
        orderBy('dueDate', 'desc')
      );
      const transactionsSnapshot = await getDocs(transactionsQuery);
      
      const packagesQuery = query(
        collection(db, 'treatmentPackages'),
        orderBy('createdAt', 'desc')
      );
      const packagesSnapshot = await getDocs(packagesQuery);

      setTransactions(transactionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
      
      setPackages(packagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    } catch (error) {
      console.error('Erro ao buscar dados financeiros:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitTransaction(e) {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'transactions'), {
        ...newTransaction,
        createdAt: new Date(),
        amount: parseFloat(newTransaction.amount)
      });
      fetchFinancialData();
      setNewTransaction({
        patientId: '',
        description: '',
        amount: '',
        paymentMethod: '',
        status: PAYMENT_STATUS.PENDING,
        dueDate: format(new Date(), 'yyyy-MM-dd')
      });
    } catch (error) {
      console.error('Erro ao criar transação:', error);
    }
  }

  function generateReceipt(transaction) {
    const doc = new jsPDF();
    
    // Cabeçalho
    doc.setFontSize(20);
    doc.text('Recibo', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('Dra. Lilian Shizue Assada', 105, 30, { align: 'center' });
    doc.text('Fisioterapeuta - CREFITO3 25022F', 105, 37, { align: 'center' });
    
    // Dados do recibo
    doc.text(`Recebemos de ${transaction.patientName}`, 20, 60);
    doc.text(`a quantia de R$ ${transaction.amount.toFixed(2)}`, 20, 70);
    doc.text(`referente a ${transaction.description}`, 20, 80);
    doc.text(`Forma de pagamento: ${PAYMENT_METHODS[transaction.paymentMethod]}`, 20, 90);
    doc.text(`Data: ${format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`, 20, 100);
    
    // Assinatura
    doc.line(20, 140, 100, 140);
    doc.text('Dra. Lilian Shizue Assada', 25, 150);
    doc.text('CREFITO3 25022F', 35, 157);
    
    doc.save(`recibo-${transaction.id}.pdf`);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              Gestão Financeira
            </h1>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                <button
                  onClick={() => setActiveTab('transactions')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'transactions'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Transações
                </button>
                <button
                  onClick={() => setActiveTab('packages')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'packages'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Pacotes de Tratamento
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'reports'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Relatórios
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'transactions' && (
                <>
                  <div className="mb-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                      Nova Transação
                    </h2>
                    <form onSubmit={handleSubmitTransaction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Paciente
                        </label>
                        <select
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={newTransaction.patientId}
                          onChange={(e) => setNewTransaction({...newTransaction, patientId: e.target.value})}
                        >
                          <option value="">Selecione o paciente</option>
                          {/* Adicionar lista de pacientes */}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Valor
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={newTransaction.amount}
                          onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Forma de Pagamento
                        </label>
                        <select
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={newTransaction.paymentMethod}
                          onChange={(e) => setNewTransaction({...newTransaction, paymentMethod: e.target.value})}
                        >
                          <option value="">Selecione a forma de pagamento</option>
                          {Object.entries(PAYMENT_METHODS).map(([key, value]) => (
                            <option key={key} value={key}>{value}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Data de Vencimento
                        </label>
                        <input
                          type="date"
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={newTransaction.dueDate}
                          onChange={(e) => setNewTransaction({...newTransaction, dueDate: e.target.value})}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Descrição
                        </label>
                        <input
                          type="text"
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={newTransaction.description}
                          onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <button
                          type="submit"
                          className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                        >
                          Registrar Transação
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="mt-8">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                      Histórico de Transações
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Data
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Paciente
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Descrição
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Valor
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Ações
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {transactions.map((transaction) => (
                            <tr key={transaction.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {format(transaction.dueDate.toDate(), "dd/MM/yyyy")}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {transaction.patientName}
                              </td>
                              <td className="px-6 py-4">
                                {transaction.description}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                R$ {transaction.amount.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  transaction.status === PAYMENT_STATUS.PAID
                                    ? 'bg-green-100 text-green-800'
                                    : transaction.status === PAYMENT_STATUS.OVERDUE
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {transaction.status === PAYMENT_STATUS.PAID ? 'Pago' :
                                   transaction.status === PAYMENT_STATUS.OVERDUE ? 'Atrasado' : 'Pendente'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => generateReceipt(transaction)}
                                  className="text-blue-600 hover:text-blue-900 mr-4"
                                >
                                  Gerar Recibo
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'packages' && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Pacotes de Tratamento
                  </h2>
                  {/* Implementar lista de pacotes */}
                </div>
              )}

              {activeTab === 'reports' && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Relatórios Financeiros
                  </h2>
                  {/* Implementar relatórios */}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}