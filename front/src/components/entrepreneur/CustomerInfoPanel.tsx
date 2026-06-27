import React, { useEffect, useState } from 'react';
import api, { getResponseData } from '../../api/config';
import { BasicCustomerInfo, SensitiveCustomerData, VerificationChannel } from '../../types/support';

interface CustomerInfoPanelProps {
  idConversation: number;
  onClose: () => void;
}

const CustomerInfoPanel: React.FC<CustomerInfoPanelProps> = ({ idConversation, onClose }) => {
  const [basicInfo, setBasicInfo] = useState<BasicCustomerInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'basic' | 'request' | 'confirm' | 'sensitive'>('basic');
  const [channel, setChannel] = useState<VerificationChannel>('Email');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [enteredCode, setEnteredCode] = useState('');
  const [dni, setDni] = useState('');
  const [sensitiveData, setSensitiveData] = useState<SensitiveCustomerData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInfo = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/support/conversations/${idConversation}/basic-info`);
        setBasicInfo(getResponseData(res) || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, [idConversation]);

  const requestCode = async () => {
    setError('');
    try {
      const res = await api.post('/support/verification/request', { idConversation, channel });
      const data = getResponseData(res);
      setGeneratedCode(data.code);
      setStep('confirm');
    } catch (err) {
      console.error(err);
      setError('No se pudo generar el código');
    }
  };

  const confirmCode = async () => {
    setError('');
    try {
      const res = await api.post('/support/verification/confirm', { idConversation, code: enteredCode, dni });
      setSensitiveData(getResponseData(res));
      setStep('sensitive');
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message ?? 'Código o DNI incorrectos');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-end z-50" onClick={onClose}>
      <div className="bg-white w-full max-w-md h-full overflow-y-auto p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900">Información del Cliente</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        {loading ? (
          <p className="text-gray-500 text-sm">Cargando...</p>
        ) : (
          <>
            <p className="text-sm font-medium text-gray-700 mb-3">Suscripciones en este club</p>
            <div className="space-y-3 mb-6">
              {basicInfo.map((info, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-3 text-sm space-y-1">
                  <p className="font-semibold text-gray-900">{info.subscriptionName}</p>
                  <p className="text-gray-600">Desde: {new Date(info.startDate).toLocaleDateString('es-AR')}</p>
                  <p className="text-gray-600">Medio de pago: {info.paymentMethodType}</p>
                  <p className="text-gray-600">Estado de envío: {info.shipmentStatus}</p>
                  {info.courier && <p className="text-gray-600">Courier: {info.courier}</p>}
                  {info.rider && <p className="text-gray-600">Rider asignado: {info.rider}</p>}
                  {(info.province || info.locality) && (
                    <p className="text-gray-600">Zona: {[info.locality, info.province].filter(Boolean).join(', ')}</p>
                  )}
                </div>
              ))}
              {basicInfo.length === 0 && <p className="text-gray-500 text-sm">Sin suscripciones registradas en este club.</p>}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Datos sensibles</p>
              <p className="text-xs text-gray-500 mb-4">Para problemas más serios podés verificar la identidad del cliente y acceder a datos como DNI, teléfono, dirección completa y últimos dígitos de tarjeta. Cada acceso queda registrado.</p>

              {step === 'basic' && (
                <button onClick={() => setStep('request')} className="w-full px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800">
                  Solicitar verificación
                </button>
              )}

              {step === 'request' && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Elegí cómo enviarle el código al cliente. Avisale por el chat que le va a llegar un código de un solo uso.</p>
                  <select value={channel} onChange={(e) => setChannel(e.target.value as VerificationChannel)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="Email">Email del club</option>
                    <option value="SMS">SMS / WhatsApp del club</option>
                  </select>
                  <button onClick={requestCode} className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                    Generar código
                  </button>
                </div>
              )}

              {step === 'confirm' && (
                <div className="space-y-3">
                  {generatedCode && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                      Código generado: <span className="font-mono font-bold">{generatedCode}</span>. Pasáselo al cliente por {channel === 'Email' ? 'mail' : 'SMS/WhatsApp'} del club. Vence en 10 minutos.
                    </div>
                  )}
                  <input
                    type="text"
                    placeholder="DNI del cliente"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Código de 6 dígitos"
                    value={enteredCode}
                    onChange={(e) => setEnteredCode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  {error && <p className="text-xs text-red-600">{error}</p>}
                  <button onClick={confirmCode} className="w-full px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700">
                    Verificar y desbloquear
                  </button>
                </div>
              )}

              {step === 'sensitive' && sensitiveData && (
                <div className="space-y-2 text-sm bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <p><span className="font-medium text-gray-700">DNI:</span> {sensitiveData.dni}</p>
                  <p><span className="font-medium text-gray-700">Teléfono:</span> {sensitiveData.phoneNumber ?? '—'}</p>
                  <p><span className="font-medium text-gray-700">Dirección:</span> {[sensitiveData.streetAddress, sensitiveData.addressNumber, sensitiveData.floorNumber].filter(Boolean).join(' ') || '—'}</p>
                  <p><span className="font-medium text-gray-700">Detalles:</span> {sensitiveData.addressDetails ?? '—'}</p>
                  <p><span className="font-medium text-gray-700">Localidad:</span> {sensitiveData.city ?? '—'} {sensitiveData.postalCode ?? ''}</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CustomerInfoPanel;