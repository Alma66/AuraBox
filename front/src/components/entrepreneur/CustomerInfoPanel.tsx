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
  const [codeRequestedAt, setCodeRequestedAt] = useState<string | null>(null);
  const [enteredCode, setEnteredCode] = useState('');
  const [dni, setDni] = useState('');
  const [sensitiveData, setSensitiveData] = useState<SensitiveCustomerData | null>(null);
  const [error, setError] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [confirming, setConfirming] = useState(false);

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
    setRequesting(true);
    try {
      const res = await api.post('/support/verification/request', { idConversation, channel });
      const data = getResponseData(res);
      setCodeRequestedAt(data.expiresAt);
      setStep('confirm');
    } catch (err) {
      console.error(err);
      setError('No se pudo generar el código');
    } finally {
      setRequesting(false);
    }
  };

  const confirmCode = async () => {
    setError('');
    setConfirming(true);
    try {
      const res = await api.post('/support/verification/confirm', { idConversation, code: enteredCode, dni });
      setSensitiveData(getResponseData(res));
      setStep('sensitive');
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message ?? 'Código o DNI incorrectos');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-aurora-navyDark/40 flex justify-end z-50" onClick={onClose}>
      <div className="bg-white w-full max-w-md h-full overflow-y-auto p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-display text-lg font-bold text-aurora-navy">Información del Cliente</h3>
          <button onClick={onClose} className="text-aurora-navy/40 hover:text-aurora-navy">✕</button>
        </div>

        {loading ? (
          <p className="text-aurora-navy/50 text-sm">Cargando...</p>
        ) : (
          <>
            <p className="text-sm font-medium text-aurora-navy/70 mb-3">Suscripciones en este club</p>
            <div className="space-y-3 mb-6">
              {basicInfo.map((info, idx) => (
                <div key={idx} className="border border-aurora-navy/10 rounded-lg p-3 text-sm space-y-1">
                  <p className="font-semibold text-aurora-navy">{info.subscriptionName}</p>
                  <p className="text-aurora-navy/60">Desde: {new Date(info.startDate).toLocaleDateString('es-AR')}</p>
                  <p className="text-aurora-navy/60">Medio de pago: {info.paymentMethodType}</p>
                  <p className="text-aurora-navy/60">Estado de envío: {info.shipmentStatus}</p>
                  {info.courier && <p className="text-aurora-navy/60">Courier: {info.courier}</p>}
                  {info.rider && <p className="text-aurora-navy/60">Rider asignado: {info.rider}</p>}
                  {(info.province || info.locality) && (
                    <p className="text-aurora-navy/60">Zona: {[info.locality, info.province].filter(Boolean).join(', ')}</p>
                  )}
                </div>
              ))}
              {basicInfo.length === 0 && <p className="text-aurora-navy/50 text-sm">Sin suscripciones registradas en este club.</p>}
            </div>

            <div className="border-t border-aurora-navy/10 pt-4">
              <p className="text-sm font-medium text-aurora-navy/70 mb-2">Datos sensibles</p>
              <p className="text-xs text-aurora-navy/50 mb-4">Para problemas más serios podés verificar la identidad del cliente y acceder a datos como DNI, teléfono, dirección completa y últimos dígitos de tarjeta. Cada acceso queda registrado.</p>

              {step === 'basic' && (
                <button onClick={() => setStep('request')} className="w-full px-4 py-2 bg-aurora-navy text-white text-sm font-medium rounded-lg hover:bg-aurora-navyLight">
                  Solicitar verificación
                </button>
              )}

              {step === 'request' && (
                <div className="space-y-3">
                  <p className="text-sm text-aurora-navy/60">Elegí cómo enviarle el código al cliente. Avisale por el chat que le va a llegar un código de un solo uso.</p>
                  <select value={channel} onChange={(e) => setChannel(e.target.value as VerificationChannel)} className="w-full px-3 py-2 border border-aurora-navy/15 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-aurora-terracotta/40">
                    <option value="Email">Email del club</option>
                    <option value="SMS">SMS / WhatsApp del club</option>
                  </select>
                  <button onClick={requestCode} disabled={requesting} className="w-full px-4 py-2 bg-aurora-terracotta text-white text-sm font-medium rounded-lg hover:bg-aurora-terracottaDark disabled:opacity-50">
                    {requesting ? 'Generando...' : 'Generar código'}
                  </button>
                </div>
              )}

              {step === 'confirm' && (
                <div className="space-y-3">
                  <div className="bg-aurora-gold/10 border border-aurora-gold/40 rounded-lg p-3 text-sm text-aurora-terracottaDark">
                    Se generó un código y se le envió al cliente por <strong>{channel === 'Email' ? 'email' : 'SMS/WhatsApp'}</strong>{codeRequestedAt ? ` (vence a las ${new Date(codeRequestedAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })})` : ''}. Pedile ese código al cliente por el chat.
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700">
                    ⚠️ El envío automático por email/SMS todavía no está implementado en el backend — este flujo no le va a llegar al cliente hasta que se desarrolle esa parte. Por ahora avisale al equipo técnico si necesitás usarlo con un cliente real.
                  </div>
                  <input
                    type="text"
                    placeholder="DNI del cliente"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    className="w-full px-3 py-2 border border-aurora-navy/15 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-aurora-terracotta/40"
                  />
                  <input
                    type="text"
                    placeholder="Código de 6 dígitos"
                    value={enteredCode}
                    onChange={(e) => setEnteredCode(e.target.value)}
                    className="w-full px-3 py-2 border border-aurora-navy/15 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-aurora-terracotta/40"
                  />
                  {error && <p className="text-xs text-red-600">{error}</p>}
                  <button onClick={confirmCode} disabled={confirming} className="w-full px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                    {confirming ? 'Verificando...' : 'Verificar y desbloquear'}
                  </button>
                </div>
              )}

              {step === 'sensitive' && sensitiveData && (
                <div className="space-y-2 text-sm bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <p><span className="font-medium text-aurora-navy/70">DNI:</span> {sensitiveData.dni}</p>
                  <p><span className="font-medium text-aurora-navy/70">Teléfono:</span> {sensitiveData.phoneNumber ?? '—'}</p>
                  <p><span className="font-medium text-aurora-navy/70">Dirección:</span> {[sensitiveData.streetAddress, sensitiveData.addressNumber, sensitiveData.floorNumber].filter(Boolean).join(' ') || '—'}</p>
                  <p><span className="font-medium text-aurora-navy/70">Detalles:</span> {sensitiveData.addressDetails ?? '—'}</p>
                  <p><span className="font-medium text-aurora-navy/70">Localidad:</span> {sensitiveData.city ?? '—'} {sensitiveData.postalCode ?? ''}</p>
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