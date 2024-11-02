import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import CompletionPopup from './CompletionPopup';

const QUESTIONS = [
  {
    id: 'intro',
    title: 'Apresentação',
    videoUrl: 'https://iframe.mediadelivery.net/embed/331912/8bf517d0-9459-4a75-bfbf-6981c4eb12ea'
  },
  {
    id: 'symptoms',
    title: 'Sintomas e desconfortos',
    videoUrl: 'https://iframe.mediadelivery.net/embed/331912/d25f2b73-577c-491a-be07-3b63130d09e5'
  },
  {
    id: 'frequency',
    title: 'Frequência dos sintomas',
    videoUrl: 'https://iframe.mediadelivery.net/embed/331912/0b614860-f5ed-45d5-9867-cdf5ee5f4eec'
  },
  {
    id: 'intensity',
    title: 'Intensidade dos sintomas',
    videoUrl: 'https://iframe.mediadelivery.net/embed/331912/6cb4ba02-5d3e-4500-8479-d8758eaf1e88'
  },
  {
    id: 'eating',
    title: 'Hábitos alimentares',
    videoUrl: 'https://iframe.mediadelivery.net/embed/331912/0c35d490-3f02-4579-b29a-5fafe973bf92'
  },
  {
    id: 'health',
    title: 'Histórico de saúde',
    videoUrl: 'https://iframe.mediadelivery.net/embed/331912/ad3a96b1-a6b3-447e-8af2-7529c6723358'
  },
  {
    id: 'reproductive',
    title: 'Questões reprodutivas',
    videoUrl: 'https://iframe.mediadelivery.net/embed/331912/69be30d8-80a2-48e9-888b-8a38c6c3edbd'
  },
  {
    id: 'stress',
    title: 'Nível de Estresse',
    videoUrl: 'https://iframe.mediadelivery.net/embed/331912/30d6985a-91fb-4974-a9f9-b2eba44d9e06'
  },
  {
    id: 'sleep',
    title: 'Qualidade do Sono',
    videoUrl: 'https://iframe.mediadelivery.net/embed/331912/24941091-a05f-4f27-a8e1-b5656685b5c5'
  },
  {
    id: 'nutrition',
    title: 'Alimentação e nutrição',
    videoUrl: 'https://iframe.mediadelivery.net/embed/331912/a0f7e231-a52f-4e0c-bdb5-d9edac2cb5f3'
  },
  {
    id: 'social',
    title: 'Apoio Social',
    videoUrl: 'https://iframe.mediadelivery.net/embed/331912/3dd540d0-cd4b-427a-994d-28e45324d5af'
  },
  {
    id: 'expectations',
    title: 'Expectativas com Acupuntura',
    videoUrl: 'https://iframe.mediadelivery.net/embed/331912/7ca982d9-40bc-464e-aaf2-ebce8775afb5'
  }
];

export default function VideoQuestion() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);

  useEffect(() => {
    if (!location.state?.userId) {
      navigate('/');
    }
  }, [location.state, navigate]);

  const currentQuestion = QUESTIONS[currentQuestionIndex];

  const handleAnswer = async (answer) => {
    try {
      const newAnswers = { ...answers, [currentQuestion.id]: answer };
      setAnswers(newAnswers);

      if (currentQuestionIndex === QUESTIONS.length - 1) {
        await addDoc(collection(db, 'questionnaires'), {
          userId: location.state.userId,
          answers: newAnswers,
          completedAt: new Date()
        });
        setShowCompletionPopup(true);
      } else {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  };

  const handleCompletionClose = () => {
    setShowCompletionPopup(false);
    navigate('/thank-you');
  };

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="max-w-4xl mx-auto p-4 w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">{currentQuestion.title}</h2>
        
        <div className="aspect-w-16">
          <iframe
            src={currentQuestion.videoUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        <div className="mt-6">
          <form onSubmit={(e) => {
            e.preventDefault();
            handleAnswer(e.target.answer.value);
          }} className="space-y-4">
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Sua resposta:
              </label>
              <textarea
                name="answer"
                required
                className="w-full h-32 p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors"
            >
              {currentQuestionIndex === QUESTIONS.length - 1 ? 'Encerrar' : 'Próxima Pergunta'}
            </button>
          </form>
        </div>
      </div>

      {showCompletionPopup && <CompletionPopup onClose={handleCompletionClose} />}
    </div>
  );
}