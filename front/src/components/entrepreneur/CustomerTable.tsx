import React, { useState, useMemo } from 'react';
import { User } from '../../types/user';

interface CustomerTableProps {
  customers: (User & { subscriptionStatus?: string; subscriptionId?: string; clubId: string })[];
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
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-aurora-navy/10 text-aurora-navy/70';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-aurora-sm border border-aurora-navy/10 p-8">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-center">
        <input
          type="text"
          placeholder="Buscar cliente por nombre, email o estado..."
          className="w-full md:w-1/2 p-3 border border-aurora-navy/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-aurora-terracotta/40 mb-4 md:mb-0"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {filteredCustomers.length === 0 ? (
        <p className="text-center text-aurora-navy/50">No se encontraron clientes que coincidan con la búsqueda.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-aurora-navy/10 rounded-lg">
              <thead>
                <tr className="bg-aurora-cream text-aurora-navy/60 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Nombre</th>
                  <th className="py-3 px-6 text-left">Email</th>
                  <th className="py-3 px-6 text-left">Estado Suscripción</th>
                  <th className="py-3 px-6 text-left">Fecha Registro</th>
                  <th className="py-3 px-6 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-aurora-navy/80 text-sm font-light">
                {currentCustomers.map((customer) => (
                  <tr key={String(customer.id)} className="border-b border-aurora-navy/5 hover:bg-aurora-cream/60">
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
                      {customer.registeredDate
                        ? new Date(customer.registeredDate).toLocaleDateString('es-AR')
                        : 'N/D'}
                    </td>
                    <td className="py-3 px-6 text-center">
                      <button
                        onClick={() => onViewCustomer(String(customer.id))}
                        className="text-aurora-navy hover:text-aurora-terracotta font-medium"
                        title="Ver/Editar Cliente"
                      >
                        Ver
                      </button>
                      {customer.subscriptionId && onViewSubscription && (
                        <button
                          onClick={() => onViewSubscription(customer.subscriptionId!)}
                          className="ml-2 text-aurora-terracotta hover:text-aurora-terracottaDark font-medium"
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
                className="px-4 py-2 bg-aurora-cream text-aurora-navy/70 rounded-lg hover:bg-aurora-navy/10 disabled:opacity-50"
              >
                Anterior
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === page ? 'bg-aurora-navy text-white' : 'bg-aurora-cream text-aurora-navy/70 hover:bg-aurora-navy/10'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-aurora-cream text-aurora-navy/70 rounded-lg hover:bg-aurora-navy/10 disabled:opacity-50"
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