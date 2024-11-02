export default function CompletionPopup({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Questionário Concluído</h2>
        <p className="text-gray-600 mb-6">
          Seu questionário será analisado pela Dra. Lilian Shizue Assada e entraremos em contato em breve.
        </p>
        <div className="text-center">
          <button
            onClick={onClose}
            className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}