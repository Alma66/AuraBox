interface TrendsChartProps {
  trends: { ratingTrend: number[] };
  monthlyExpenses: { month: string; amount: number }[];
}

const TrendsChart: React.FC<TrendsChartProps> = ({ trends, monthlyExpenses }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tendencia de Ratings</h3>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
          <p className="text-gray-500">Gráfico de Línea: Ratings {trends.ratingTrend.join(' → ')}</p>
          <p className="text-sm text-gray-400 mt-2">Implementar con Chart.js (datos mensuales)</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Gastos Mensuales</h3>
        <div className="space-y-2">
          {monthlyExpenses.slice(-6).map((exp) => (
            <div key={exp.month} className="flex justify-between text-sm">
              <span>{exp.month}</span>
              <span className="font-semibold text-red-600">-${exp.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendsChart;