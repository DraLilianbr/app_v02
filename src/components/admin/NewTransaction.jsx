import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export default function NewTransaction() {
  const [formData, setFormData] = useState({
    patientId: '',
    description: '',
    amount: '',
    paymentMethod: 'cash',
    status: 'pending',
    date: new Date().toISOString().split('T')[0]
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, 'transactions'), {
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date),
        createdAt: new Date()
      });

      // Limpar formulário
      setFormData({
        patientId: '',
        description: '',
        amount: '',
        paymentMethod: 'cash',
        status: 'pending',
        date: new Date().toISOString().split('T')[0]
      });

      alert('Transação registrada com sucesso!');
    } catch (error) {
      console.error('Erro ao registrar transação:', error);
      alert('Erro ao registrar transação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Nova Transação</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Paciente
            </label>
            <select
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.patientId}
              onChange={(e) => setFormData({...formData, patientId: e.target.value})}
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
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Forma de Pagamento
            </label>
            <select
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.paymentMethod}
              onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
            >
              <option value="cash">Dinheiro</option>
              <option value="credit">Cartão de Crédito</option>
              <option value="debit">Cartão de Débito</option>
              <option value="pix">PIX</option>
              <option value="transfer">Transferência</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Data
            </label>
            <input
              type="date"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Descrição
            </label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
          >
            {loading ? 'Registrando...' : 'Registrar Transação'}
          </button>
        </div>
      </form>
    </div>
  );
}