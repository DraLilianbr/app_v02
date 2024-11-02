import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [treatments, setTreatments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [activeTab, setActiveTab] = useState('info');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthdate: '',
    address: '',
    medicalHistory: '',
    allergies: '',
    medications: '',
    observations: ''
  });

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  async function fetchPatientData() {
    try {
      const patientDoc = await getDoc(doc(db, 'patients', id));
      if (patientDoc.exists()) {
        const data = patientDoc.data();
        setPatient(data);
        setFormData(data);
        
        // Buscar tratamentos
        const treatmentsQuery = query(
          collection(db, 'treatments'),
          orderBy('startDate', 'desc')
        );
        const treatmentsSnapshot = await getDocs(treatmentsQuery);
        setTreatments(treatmentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));

        // Buscar documentos
        const documentsQuery = query(
          collection(db, 'documents'),
          orderBy('uploadDate', 'desc')
        );
        const documentsSnapshot = await getDocs(documentsQuery);
        setDocuments(documentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
      }
    } catch (error) {
      console.error('Erro ao buscar dados do paciente:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'patients', id), formData);
      setPatient(formData);
      setEditMode(false);
    } catch (error) {
      console.error('Erro ao atualizar paciente:', error);
    }
  }

  async function addTreatment(treatmentData) {
    try {
      await addDoc(collection(db, 'treatments'), {
        patientId: id,
        ...treatmentData,
        startDate: new Date()
      });
      fetchPatientData();
    } catch (error) {
      console.error('Erro ao adicionar tratamento:', error);
    }
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
              {editMode ? 'Editar Paciente' : patient.name}
            </h1>
            <div className="space-x-4">
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  Editar
                </button>
              )}
              <button
                onClick={() => navigate('/admin/patients')}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Voltar
              </button>
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'info'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Informações Pessoais
                </button>
                <button
                  onClick={() => setActiveTab('medical')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'medical'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Histórico Médico
                </button>
                <button
                  onClick={() => setActiveTab('treatments')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'treatments'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Tratamentos
                </button>
                <button
                  onClick={() => setActiveTab('documents')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'documents'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Documentos
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'info' && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        required
                        disabled={!editMode}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        disabled={!editMode}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Telefone
                      </label>
                      <input
                        type="tel"
                        required
                        disabled={!editMode}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Data de Nascimento
                      </label>
                      <input
                        type="date"
                        required
                        disabled={!editMode}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={formData.birthdate}
                        onChange={(e) => setFormData({...formData, birthdate: e.target.value})}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Endereço
                      </label>
                      <input
                        type="text"
                        disabled={!editMode}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                      />
                    </div>
                  </div>

                  {editMode && (
                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={() => {
                          setEditMode(false);
                          setFormData(patient);
                        }}
                        className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                      >
                        Salvar
                      </button>
                    </div>
                  )}
                </form>
              )}

              {activeTab === 'medical' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Histórico Médico
                    </h3>
                    <textarea
                      rows={4}
                      disabled={!editMode}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={formData.medicalHistory}
                      onChange={(e) => setFormData({...formData, medicalHistory: e.target.value})}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Alergias
                    </h3>
                    <textarea
                      rows={2}
                      disabled={!editMode}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={formData.allergies}
                      onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Medicamentos em Uso
                    </h3>
                    <textarea
                      rows={2}
                      disabled={!editMode}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={formData.medications}
                      onChange={(e) => setFormData({...formData, medications: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'treatments' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium text-gray-900">
                      Tratamentos
                    </h3>
                    <button
                      onClick={() => {/* Implementar modal de novo tratamento */}}
                      className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                    >
                      Novo Tratamento
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Data Início
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tipo
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
                        {treatments.map((treatment) => (
                          <tr key={treatment.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {format(treatment.startDate.toDate(), "dd/MM/yyyy")}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {treatment.type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                treatment.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {treatment.status === 'active' ? 'Ativo' : 'Concluído'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button className="text-blue-600 hover:text-blue-900">
                                Ver Detalhes
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium text-gray-900">
                      Documentos
                    </h3>
                    <button
                      onClick={() => {/* Implementar upload de documento */}}
                      className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                    >
                      Novo Documento
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {documents.map((document) => (
                      <div
                        key={document.id}
                        className="bg-white overflow-hidden shadow rounded-lg"
                      >
                        <div className="p-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              {/* Ícone do documento */}
                              <svg
                                className="h-8 w-8 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                            <div className="ml-5">
                              <h4 className="text-lg font-medium text-gray-900">
                                {document.name}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {format(document.uploadDate.toDate(), "dd/MM/yyyy")}
                              </p>
                            </div>
                          </div>
                          <div className="mt-4">
                            <button
                              onClick={() => {/* Implementar visualização */}}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              Visualizar
                            </button>
                            <button
                              onClick={() => {/* Implementar download */}}
                              className="text-green-600 hover:text-green-900"
                            >
                              Download
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}