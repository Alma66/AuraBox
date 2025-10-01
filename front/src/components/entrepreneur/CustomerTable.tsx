// FileName: src/components/entrepreneur/CustomerTable.tsx
import React, { useState, useMemo } from 'react';
import { User } from '../../types/user';

interface CustomerTableProps {
  customers: (User  & { subscriptionStatus?: string; subscriptionId?: string; clubId: string })[];
  onViewCustomer: (customerId: string) => void;
  onViewSubscription?: (subscriptionId: string) => void;
}

const CustomerTable: React.FC<CustomerTableProps> = ({ customers, onViewCustomer, onViewSubscription }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (customer) =>
        customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.subscriptionStatus?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customers, searchTerm]);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const currentCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCustomers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCustomers, currentPage, itemsPerPage]);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-200 text-green-800';
      case 'paused':
        return 'bg-yellow-200 text-yellow-800';
      case 'cancelled':
        return 'bg-red-200 text-red-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-center">
        <input
          type="text"
          placeholder="Buscar cliente por nombre, email o estado..."
          className="w-full md:w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 mb-4 md:mb-0"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {filteredCustomers.length === 0 ? (
        <p className="text-center text-gray-600">No se encontraron clientes que coincidan con la búsqueda.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Nombre</th>
                  <th className="py-3 px-6 text-left">Email</th>
                  <th className="py-3 px-6 text-left">Estado Suscripción</th>
                  <th className="py-3 px-6 text-left">Fecha Registro</th>
                  <th className="py-3 px-6 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 text-sm font-light">
                {currentCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      {customer.firstName} {customer.lastName}
                    </td>
                    <td className="py-3 px-6 text-left">{customer.email}</td>
                    <td className="py-3 px-6 text-left">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          customer.subscriptionStatus
                        )}`}
                      >
                        {customer.subscriptionStatus || 'Sin Suscripción'}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-left">
                      {new Date(customer.registeredDate).toLocaleDateString('es-AR')}
                    </td>
                    <td className="py-3 px-6 text-center">
                      <button
                        onClick={() => onViewCustomer(customer.id)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                        title="Ver/Editar Cliente"
                      >
                        Ver
                      </button>
                      {customer.subscriptionId && onViewSubscription && (
                        <button
                          onClick={() => onViewSubscription(customer.subscriptionId!)}
                          className="ml-2 text-purple-600 hover:text-purple-800 font-medium"
                          title="Ver Suscripción"
                        >
                          Ver Suscripción
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                Anterior
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CustomerTable;