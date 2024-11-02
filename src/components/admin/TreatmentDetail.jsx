import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TREATMENT_TYPES = {
  ACUPUNTURA: 'Acupuntura Tradicional',
  AURICULAR: 'Acupuntura Auricular',
  VENTOSA: 'Ventosaterapia',
  MOXABUSTAO: 'Moxabustão',
  ELETROACUPUNTURA: 'Eletroacupuntura'
};

const TREATMENT_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  SUSPENDED: 'suspended'
};

export default function TreatmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [treatment, setTreatment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    status: TREATMENT_STATUS.ACTIVE,
    protocol: '',
    mainComplaints: '',
    objectives: '',
    points: '',
    notes: '',
    progressNotes: [],
    beforePhotos: [],
    afterPhotos: []
  });

  useEffect(() => {
    fetchTreatmentData();
  }, [id]);

  async function fetchTreatmentData() {
    try {
      const treatmentDoc = await getDoc(doc(db, 'treatments', id));
      if (treatmentDoc.exists()) {
        const data = treatmentDoc.data();
        setTreatment(data);
        setFormData(data);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do tratamento:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'treatments', id), formData);
      setTreatment(formData);
      setEditMode(false);
    } catch (error) {
      console.error('Erro ao atualizar tratamento:', error);
    }
  }

  async function addProgressNote(note) {
    const newNote = {
      date: new Date(),
      content: note,
      author: 'Dr. Nome' // Substituir pelo nome do usuário logado
    };

    try {
      const updatedNotes = [...formData.progressNotes, newNote];
      await updateDoc(doc(db, 'treatments', id), {
        progressNotes: updatedNotes
      });
      setFormData(prev => ({
        ...prev,
        progressNotes: updatedNotes
      }));
    } catch (error) {
      console.error('Erro ao adicionar nota de progresso:', error);
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
              Detalhes do Tratamento
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
                onClick={() => navigate(-1)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Voltar
              </button>
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tipo de Tratamento
                  </label>
                  <select
                    disabled={!editMode}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="">Selecione o tipo</option>
                    {Object.entries(TREATMENT_TYPES).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    disabled={!editMode}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value={TREATMENT_STATUS.ACTIVE}>Ativo</option>
                    <option value={TREATMENT_STATUS.COMPLETED}>Concluído</option>
                    <option value={TREATMENT_STATUS.SUSPENDED}>Suspenso</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Queixas Principais
                  </label>
                  <textarea
                    rows={3}
                    disabled={!editMode}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.mainComplaints}
                    onChange={(e) => setFormData({...formData, mainComplaints: e.target.value})}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Objetivos do Tratamento
                  </label>
                  <textarea
                    rows={3}
                    disabled={!editMode}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.objectives}
                    onChange={(e) => setFormData({...formData, objectives: e.target.value})}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Protocolo de Tratamento
                  </label>
                  <textarea
                    rows={4}
                    disabled={!editMode}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.protocol}
                    onChange={(e) => setFormData({...formData, protocol: e.target.value})}
                    placeholder="Descreva o protocolo de tratamento, incluindo pontos de acupuntura, técnicas e frequência"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Pontos de Acupuntura
                  </label>
                  <textarea
                    rows={3}
                    disabled={!editMode}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.points}
                    onChange={(e) => setFormData({...formData, points: e.target.value})}
                    placeholder="Liste os pontos de acupuntura utilizados"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Observações Gerais
                  </label>
                  <textarea
                    rows={3}
                    disabled={!editMode}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
                </div>
              </div>

              {editMode && (
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      setFormData(treatment);
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

            {/* Seção de Progresso */}
            <div className="border-t border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">
                  Notas de Progresso
                </h2>
                <button
                  onClick={() => {
                    const note = prompt('Digite a nota de progresso:');
                    if (note) addProgressNote(note);
                  }}
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                >
                  Adicionar Nota
                </button>
              </div>

              <div className="space-y-4">
                {formData.progressNotes?.map((note, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-500">
                          {format(note.date.toDate(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                        <p className="text-sm text-gray-500">{note.author}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-gray-700">{note.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Seção de Fotos */}
            <div className="border-t border-gray-200 p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Fotos Antes do Tratamento
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {formData.beforePhotos?.map((photo, index) => (
                      <img
                        key={index}
                        src={photo.url}
                        alt={`Antes ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    ))}
                    <button
                      onClick={() => {/* Implementar upload de foto */}}
                      className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-700"
                    >
                      + Adicionar Foto
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Fotos Depois do Tratamento
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {formData.afterPhotos?.map((photo, index) => (
                      <img
                        key={index}
                        src={photo.url}
                        alt={`Depois ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    ))}
                    <button
                      onClick={() => {/* Implementar upload de foto */}}
                      className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-700"
                    >
                      + Adicionar Foto
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}