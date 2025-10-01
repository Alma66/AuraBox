// FileName: src/components/entrepreneur/SalesTable.tsx
import React from 'react';
import { Subscription } from '../../types/subscription';
import { User } from '../../types/user';

interface SalesTableProps {
  subscriptions: Subscription[];
  usersData: User[];
}

const SalesTable: React.FC<SalesTableProps> = ({ subscriptions, usersData }) => {
  const getUserName = (userId: string) => {
    const user = usersData.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Anónimo';
  };

  const getRandomAmount = () => Math.round(Math.random() * 30000 + 20000); // Simulado

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Suscripción</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {subscriptions.map((sub) => (
              <tr key={sub.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(sub.startDate).toLocaleDateString('es-AR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sub.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getUserName(sub.userId)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sub.planId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${getRandomAmount().toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    sub.status === 'active' ? 'bg-green-100 text-green-800' :
                    sub.status === 'paused' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {sub.status}
                  </span>
                </td>
              </tr>
            ))}
            {subscriptions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No hay ventas que coincidan con los filtros.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesTable;