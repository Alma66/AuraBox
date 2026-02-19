import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/config';

const RegisterPage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [documentType, setDocumentType] = useState('DNI');
  const [documentNumber, setDocumentNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [userType, setUserType] = useState('customer');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (!birthDate) {
      setError('La fecha de nacimiento es obligatoria.');
      return;
    }

    const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
    if (userType === 'customer' && age < 16) {
      setError('Debes tener al menos 16 años.');
      return;
    }
    if (userType === 'entrepreneur' && age < 18) {
      setError('Debes tener al menos 18 años.');
      return;
    }

    setLoading(true);

    try {
      const dto: any = {
        firstName,
        lastName,
        email,
        password,
        documentType,
        documentNumber: parseInt(documentNumber),
        phoneNumber: phoneNumber ? parseInt(phoneNumber) : null,
        birthDate,
        userType,
      };

      if (userType === 'entrepreneur') {
        dto.city = city;
        dto.province = province;
      }

      await api.post('/auth/register', dto);
      
      alert('Registro exitoso. Por favor, inicia sesión.');
      navigate('/login');
    } catch (err: any) {
      console.error("Register error:", err);
      const message = err.response?.data?.message || err.response?.data?.error || 'Error al registrarse. Intenta de nuevo.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crea tu cuenta en AuraBox
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="first-name" className="sr-only">Nombre</label>
              <input id="first-name" name="firstName" type="text" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="Nombre" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div>
              <label htmlFor="last-name" className="sr-only">Apellido</label>
              <input id="last-name" name="lastName" type="text" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="Apellido" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">Dirección de Email</label>
              <input id="email-address" name="email" type="email" autoComplete="email" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="Dirección de Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label htmlFor="birth-date" className="sr-only">Fecha de Nacimiento</label>
              <input id="birth-date" name="birthDate" type="date" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
            </div>
            <div>
              <label htmlFor="document-type" className="sr-only">Tipo de Documento</label>
              <select id="document-type" name="documentType" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" value={documentType} onChange={(e) => setDocumentType(e.target.value)}>
                <option value="DNI">DNI</option>
                <option value="Pasaporte">Pasaporte</option>
                <option value="LC">LC</option>
                <option value="LE">LE</option>
              </select>
            </div>
            <div>
              <label htmlFor="document-number" className="sr-only">Número de Documento</label>
              <input id="document-number" name="documentNumber" type="number" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="Número de Documento" value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} />
            </div>
            <div>
              <label htmlFor="phone-number" className="sr-only">Número de Teléfono</label>
              <input id="phone-number" name="phoneNumber" type="tel" className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="Número de Teléfono" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
            </div>
            {userType === 'entrepreneur' && (
              <>
                <div>
                  <label htmlFor="city" className="sr-only">Ciudad</label>
                  <input id="city" name="city" type="text" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="Ciudad" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="province" className="sr-only">Provincia</label>
                  <input id="province" name="province" type="text" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="Provincia" value={province} onChange={(e) => setProvince(e.target.value)} />
                </div>
              </>
            )}
            <div>
              <label htmlFor="password" className="sr-only">Contraseña</label>
              <input id="password" name="password" type="password" autoComplete="new-password" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">Confirmar Contraseña</label>
              <input id="confirm-password" name="confirm-password" type="password" autoComplete="new-password" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="Confirmar Contraseña" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center justify-center space-x-4">
            <label className="inline-flex items-center">
              <input type="radio" name="userType" value="customer" checked={userType === 'customer'} onChange={(e) => setUserType(e.target.value)} className="form-radio h-4 w-4 text-blue-600" />
              <span className="ml-2 text-gray-900">Soy un cliente</span>
            </label>
            <label className="inline-flex items-center">
              <input type="radio" name="userType" value="entrepreneur" checked={userType === 'entrepreneur'} onChange={(e) => setUserType(e.target.value)} className="form-radio h-4 w-4 text-blue-600" />
              <span className="ml-2 text-gray-900">Soy un emprendedor</span>
            </label>
          </div>
          {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</p>}
          <div>
            <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
              {loading ? 'Registrando...' : 'Registrarse'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;