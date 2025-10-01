// FileName: src/components/entrepreneur/RatingDistribution.tsx
interface RatingDistributionProps {
  reviews: { rating: number }[];
}

const RatingDistribution: React.FC<RatingDistributionProps> = ({ reviews }) => {
  const getCount = (rating: number) => reviews.filter(r => r.rating === rating).length;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribución de Ratings</h3>
      <div className="space-y-3">
        {[5, 4, 3, 2, 1].map(rating => {
          const count = getCount(rating);
          const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
          return (
            <div key={rating} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{rating} ★</span>
              <div className="flex items-center w-full ml-4">
                <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                  <div 
                    className={`h-2 rounded-full ${rating >= 4 ? 'bg-green-500' : rating === 3 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RatingDistribution;