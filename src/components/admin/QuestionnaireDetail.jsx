import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const QUESTIONS = [
  { id: 'symptoms', title: 'Sintomas e desconfortos' },
  { id: 'frequency', title: 'Frequência dos sintomas' },
  { id: 'intensity', title: 'Intensidade dos sintomas' },
  { id: 'eating', title: 'Hábitos alimentares' },
  { id: 'health', title: 'Histórico de saúde' },
  { id: 'reproductive', title: 'Questões reprodutivas' },
  { id: 'stress', title: 'Nível de estresse' },
  { id: 'sleep', title: 'Qualidade do sono' },
  { id: 'nutrition', title: 'Alimentação e nutrição' },
  { id: 'social', title: 'Apoio social' },
  { id: 'expectations', title: 'Expectativas com Acupuntura' }
];

export default function QuestionnaireDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [questionnaire, setQuestionnaire] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    try {
      const questionnaireDoc = await getDoc(doc(db, 'questionnaires', id));
      if (!questionnaireDoc.exists()) {
        navigate('/admin/questionnaires');
        return;
      }

      const questionnaireData = questionnaireDoc.data();
      const userDoc = await getDoc(doc(db, 'users', questionnaireData.userId));
      
      setQuestionnaire(questionnaireData);
      setPatient(userDoc.exists() ? userDoc.data() : null);
    } catch (error) {
      console.error('Erro ao buscar questionário:', error);
    } finally {
      setLoading(false);
    }
  }

  const generatePDF = () => {
    if (!questionnaire || !patient) return;

    const doc = new jsPDF();
    
    // Cabeçalho
    doc.setFontSize(20);
    doc.text('Relatório Detalhado do Questionário', 14, 20);
    
    // Informações do paciente
    doc.setFontSize(12);
    doc.text('Informações do Paciente:', 14, 30);
    doc.text(`Nome: ${patient.name}`, 14, 40);
    doc.text(`Email: ${patient.email}`, 14, 45);
    doc.text(`Telefone: ${patient.phone}`, 14, 50);
    doc.text(`Data de Nascimento: ${patient.birthdate}`, 14, 55);
    doc.text(`Data do Questionário: ${format(questionnaire.completedAt.toDate(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`, 14, 60);
    
    // Respostas
    doc.text('Respostas do Questionário:', 14, 70);
    
    const answers = QUESTIONS.map(question => [
      question.title,
      questionnaire.answers[question.id] || 'Não respondido'
    ]);
    
    doc.autoTable({
      startY: 75,
      head: [['Pergunta', 'Resposta']],
      body: answers,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 100 }
      }
    });
    
    doc.save(`questionario-detalhado-${patient.name}-${format(new Date(), 'dd-MM-yyyy')}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  if (!questionnaire || !patient) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-red-600">Questionário não encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Detalhes do Questionário</h1>
            <div className="space-x-4">
              <button
                onClick={generatePDF}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                Gerar PDF
              </button>
              <button
                onClick={() => navigate('/admin/questionnaires')}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Voltar
              </button>
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Informações do Paciente
              </h3>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Nome completo</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {patient.name}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {patient.email}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Telefone</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {patient.phone}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Data de submissão</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {format(questionnaire.completedAt.toDate(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Respostas do Questionário
              </h3>
            </div>
            <div className="border-t border-gray-200">
              {QUESTIONS.map((question) => (
                <div key={question.id} className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h4 className="text-md font-medium text-gray-900 mb-2">
                    {question.title}
                  </h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {questionnaire.answers[question.id] || 'Não respondido'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}