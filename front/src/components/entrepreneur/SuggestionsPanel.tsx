interface SuggestionsPanelProps {
  positiveWords: string[];
  negativeWords: string[];
  avgRating: number;
}

const SuggestionsPanel: React.FC<SuggestionsPanelProps> = ({ positiveWords, negativeWords, avgRating }) => {
  const suggestions = [
    {
      title: 'Fortalezas a Destacar',
      items: positiveWords.length > 0 
        ? positiveWords.map(word => `Enfatiza "${word}" en tu storytelling y marketing.`)
        : ['No se detectaron fortalezas específicas. Revisa reseñas para identificar patrones.'],
      icon: 'M5 13l4 4L19 7',
      color: 'text-green-700 bg-green-50'
    },
    {
      title: 'Áreas de Mejora',
      items: negativeWords.length > 0 
        ? negativeWords.map(word => `Aborda menciones de "${word}" (e.g., mejora logística si es "tarde").`)
        : ['¡Excelente! No hay áreas críticas. Mantén el alto rating.'],
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      color: 'text-red-700 bg-red-50'
    },
    {
      title: 'Recomendación General',
      items: [
        avgRating > 4.5 ? 'Tu rating es excelente. Considera incentivar más reseñas para mantener el momentum.' :
        avgRating > 3.5 ? 'Rating sólido. Enfócate en feedback mixto para llegar a 4.5+.' :
        'Rating por mejorar. Prioriza respuestas a reseñas negativas para construir confianza.'
      ],
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'text-blue-700 bg-blue-50'
    }
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Sugerencias Basadas en Feedback</h3>
      <div className="space-y-6">
        {suggestions.map((suggestion, index) => (
          <div key={index} className={`p-4 rounded-lg ${suggestion.color}`}>
            <div className="flex items-start space-x-3">
              <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${suggestion.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={suggestion.icon}></path>
              </svg>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-2">{suggestion.title}</h4>
                <ul className="space-y-1 text-sm">
                  {suggestion.items.map((item, i) => (
                    <li key={i} className="flex items-start">
                      <span>•</span>
                      <span className="ml-2">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestionsPanel;