export default function ThankYouPage({ videoUrl }) {
  return (
    <div className="max-w-5xl mx-auto p-4 min-h-screen flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-6">Agradecimento</h2>
      
      {/* Larger video container */}
      <div className="w-full max-w-4xl mb-8">
        <div className="aspect-w-16 aspect-h-9">
          <iframe
            src={videoUrl}
            className="w-full h-full rounded-lg shadow-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>

      <div className="text-center mt-8 max-w-2xl">
        <p className="text-xl text-gray-700 mb-4">
          Obrigado por completar o questionário!
        </p>
        <p className="text-lg text-gray-600">
          Entraremos em contato em breve para dar continuidade ao seu atendimento.
        </p>
      </div>
    </div>
  );
}