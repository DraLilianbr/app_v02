import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function QuestionnaireList() {
  const [questionnaires, setQuestionnaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredQuestionnaires, setFilteredQuestionnaires] = useState([]);

  useEffect(() => {
    fetchQuestionnaires();
  }, []);

  useEffect(() => {
    const filtered = questionnaires.filter(q => 
      q.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.patientEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredQuestionnaires(filtered);
  }, [searchTerm, questionnaires]);

  async function fetchQuestionnaires() {
    try {
      const q = query(collection(db, 'questionnaires'), orderBy('completedAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const questionnairesData = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          const userDoc = await getDocs(
            query(collection(db, 'users'), where('id', '==', data.userId))
          );
          const user = userDoc.docs[0]?.data() || {};
          
          return {
            id: doc.id,
            ...data,
            patientName: user.name || 'N/A',
            patientEmail: user.email || 'N/A',
            patientPhone: user.phone || 'N/A'
          };
        })
      );
      
      setQuestionnaires(questionnairesData);
      setFilteredQuestionnaires(questionnairesData);
    } catch (error) {
      console.error('Erro ao buscar questionários:', error);
    } finally {
      setLoading(false);
    }
  }

  const generatePDF = (questionnaire) => {
    const doc = new jsPDF();
    
    // Cabeçalho
    doc.setFontSize(20);
    doc.text('Relatório do Questionário', 14, 20);
    
    // Informações do paciente
    doc.setFontSize(12);
    doc.text('Informações do Paciente:', 14, 30);
    doc.text(`Nome: ${questionnaire.patientName}`, 14, 40);
    doc.text(`Email: ${questionnaire.patientEmail}`, 14, 45);
    doc.text(`Telefone: ${questionnaire.patientPhone}`, 14, 50);
    doc.text(`Data: ${format(questionnaire.completedAt.toDate(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`, 14, 55);
    
    // Respostas
    doc.text('Respostas:', 14, 65);
    
    const answers = Object.entries(questionnaire.answers).map(([question, answer]) => [
      question,
      answer
    ]);
    
    doc.autoTable({
      startY: 70,
      head: [['Pergunta', 'Resposta']],
      body: answers,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 100 }
      }
    });
    
    doc.save(`questionario-${questionnaire.patientName}-${format(new Date(), 'dd-MM-yyyy')}.pdf`);
  };

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
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Questionários Respondidos</h1>
          
          {/* Barra de pesquisa */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Pesquisar por nome ou email..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="absolute right-3 top-2.5 text-gray-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data de Submissão
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuestionnaires.map((questionnaire) => (
                  <tr key={questionnaire.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {questionnaire.patientName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {questionnaire.patientEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {questionnaire.patientPhone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(questionnaire.completedAt.toDate(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(questionnaire.completedAt.toDate(), "HH:mm", { locale: ptBR })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/admin/questionnaires/${questionnaire.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Ver Detalhes
                      </Link>
                      <button
                        onClick={() => generatePDF(questionnaire)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Gerar PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}