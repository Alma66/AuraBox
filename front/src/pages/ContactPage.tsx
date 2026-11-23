import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/config';
import Reveal from '../components/common/Reveal';

const CONTACT_EMAIL = 'auraboxcompany@gmail.com';
const CONTACT_PHONE = '+54 9 11 5702-7399';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const LIMITS = {
  name: { min: 2, max: 100 },
  subject: { min: 3, max: 150 },
  message: { min: 10, max: 2000 },
};

type FieldName = 'name' | 'email' | 'subject' | 'message';
type FieldErrors = Partial<Record<FieldName, string>>;

const FIELD_ORDER: FieldName[] = ['name', 'email', 'subject', 'message'];

const validate = (data: Record<FieldName, string>): FieldErrors => {
  const errors: FieldErrors = {};
  const name = data.name.trim();
  const email = data.email.trim();
  const subject = data.subject.trim();
  const message = data.message.trim();

  if (!name) errors.name = 'Ingresá tu nombre.';
  else if (name.length < LIMITS.name.min) errors.name = `El nombre debe tener al menos ${LIMITS.name.min} caracteres.`;

  if (!email) errors.email = 'Ingresá tu correo.';
  else if (!EMAIL_REGEX.test(email)) errors.email = 'Ingresá un correo válido, por ejemplo tu@email.com.';

  if (!subject) errors.subject = 'Ingresá un asunto.';
  else if (subject.length < LIMITS.subject.min) errors.subject = `El asunto debe tener al menos ${LIMITS.subject.min} caracteres.`;

  if (!message) errors.message = 'Escribí tu mensaje.';
  else if (message.length < LIMITS.message.min) {
    errors.message = `El mensaje debe tener al menos ${LIMITS.message.min} caracteres (escribiste ${message.length}).`;
  }

  return errors;
};

const FieldError: React.FC<{ id: string; message?: string }> = ({ id, message }) =>
  message ? (
    <p id={id} role="alert" className="mt-1 text-xs text-red-600">
      {message}
    </p>
  ) : null;

interface InfoRowProps {
  d: string;
  label: string;
  children: React.ReactNode;
}

const InfoRow: React.FC<InfoRowProps> = ({ d, label, children }) => (
  <li className="flex items-start gap-4">
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-aurora-terracotta to-aurora-coral text-white">
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
        <path d={d} />
      </svg>
    </span>
    <span className="min-w-0">
      <b className="block text-sm font-semibold text-aurora-navy">{label}</b>
      <span className="break-words text-aurora-navy/70">{children}</span>
    </span>
  </li>
);

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<Record<FieldName, string>>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [errorText, setErrorText] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const feedbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ((status === 'sent' || errorText) && feedbackRef.current) {
      feedbackRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [status, errorText]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const field = e.target.name as FieldName;
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    if (status === 'sent') setStatus('idle');
  };

  const inputClass = (field: FieldName, extra = '') =>
    `input-aurora mt-1 ${extra} ${fieldErrors[field] ? 'border-red-400 focus:border-red-400 focus:ring-red-300/60' : ''}`.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    setErrorText('');

    const errors = validate(formData);
    setFieldErrors(errors);
    const firstInvalid = FIELD_ORDER.find((field) => errors[field]);
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    setStatus('sending');
    try {
      await api.post(
        '/inbound/contact',
        {
          fullName: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
          website,
        },
        { timeout: 20000 },
      );
      setFormData({ name: '', email: '', subject: '', message: '' });
      setStatus('sent');
    } catch (err: any) {
      const message = err.response?.data?.message;
      if (err.code === 'ECONNABORTED') {
        setErrorText('El envío tardó demasiado. Revisá tu conexión e intentá de nuevo.');
      } else if (!err.response) {
        setErrorText('No pudimos conectarnos con el servidor. Revisá tu conexión e intentá de nuevo.');
      } else {
        setErrorText(
          Array.isArray(message)
            ? message.join('. ')
            : message || 'No pudimos enviar tu mensaje. Intentá de nuevo en un rato.',
        );
      }
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-screen bg-aurora-cream">
      <section className="hero-mesh grain relative isolate overflow-hidden px-4 pb-32 pt-16 text-center text-white">
        <div className="pointer-events-none absolute -right-16 -top-16 -z-10 h-72 w-72 animate-blobMove rounded-full bg-aurora-sun/30 blur-3xl" />
        <div
          className="pointer-events-none absolute -bottom-20 -left-16 -z-10 h-72 w-72 animate-blobMove rounded-full bg-aurora-coral/40 blur-3xl"
          style={{ animationDelay: '-8s' }}
        />
        <span className="glass mb-5 inline-block animate-fadeInUp rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest">
          Estamos para ayudarte
        </span>
        <h1 className="mx-auto max-w-3xl animate-fadeInUp font-display text-4xl font-normal leading-[1.05] md:text-6xl">
          Hablemos, <em className="italic text-aurora-goldLight">te leemos</em>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-white/85">
          Escribinos tu consulta y te respondemos por correo lo antes posible.
        </p>
        <svg className="absolute bottom-[-1px] left-0 block h-10 w-full text-aurora-cream md:h-14" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
          <path fill="currentColor" d="M0,48 C240,96 480,0 720,32 C960,64 1200,96 1440,40 L1440,80 L0,80 Z" />
        </svg>
      </section>

      <div className="mx-auto -mt-16 max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.25fr_1fr]">
          <Reveal>
            <div className="rounded-3xl bg-white p-8 shadow-aurora-lg ring-1 ring-aurora-navy/5 md:p-10">
              <h2 className="font-display text-3xl font-medium text-aurora-navy">Envianos un mensaje</h2>
              <p className="mt-2 text-sm text-aurora-navy/60">
                Los campos con <span className="font-semibold text-aurora-terracotta">*</span> son obligatorios.
              </p>
              <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
                <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                  <label htmlFor="contact-website">No completar</label>
                  <input id="contact-website" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-aurora-navy/70">
                      Nombre completo <span className="text-aurora-terracotta" aria-hidden="true">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      autoComplete="name"
                      maxLength={LIMITS.name.max}
                      value={formData.name}
                      onChange={handleChange}
                      aria-invalid={!!fieldErrors.name}
                      aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                      className={inputClass('name')}
                    />
                    <FieldError id="name-error" message={fieldErrors.name} />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-aurora-navy/70">
                      Correo electrónico <span className="text-aurora-terracotta" aria-hidden="true">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      autoComplete="email"
                      maxLength={120}
                      value={formData.email}
                      onChange={handleChange}
                      aria-invalid={!!fieldErrors.email}
                      aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                      className={inputClass('email')}
                    />
                    <FieldError id="email-error" message={fieldErrors.email} />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-aurora-navy/70">
                    Asunto <span className="text-aurora-terracotta" aria-hidden="true">*</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    id="subject"
                    maxLength={LIMITS.subject.max}
                    value={formData.subject}
                    onChange={handleChange}
                    aria-invalid={!!fieldErrors.subject}
                    aria-describedby={fieldErrors.subject ? 'subject-error' : undefined}
                    className={inputClass('subject')}
                  />
                  <FieldError id="subject-error" message={fieldErrors.subject} />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-aurora-navy/70">
                    Tu mensaje <span className="text-aurora-terracotta" aria-hidden="true">*</span>
                  </label>
                  <textarea
                    name="message"
                    id="message"
                    rows={6}
                    maxLength={LIMITS.message.max}
                    value={formData.message}
                    onChange={handleChange}
                    aria-invalid={!!fieldErrors.message}
                    aria-describedby={fieldErrors.message ? 'message-error' : 'message-hint'}
                    className={inputClass('message', 'resize-none')}
                  ></textarea>
                  <div className="mt-1 flex items-start justify-between gap-3">
                    <div className="flex-1">
                      {fieldErrors.message ? (
                        <FieldError id="message-error" message={fieldErrors.message} />
                      ) : (
                        <p id="message-hint" className="text-xs text-aurora-navy/45">
                          Mínimo {LIMITS.message.min} caracteres.
                        </p>
                      )}
                    </div>
                    <p className="text-xs tabular-nums text-aurora-navy/45">
                      {formData.message.length}/{LIMITS.message.max}
                    </p>
                  </div>
                </div>

                <div ref={feedbackRef}>
                  {errorText && (
                    <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-center text-sm text-red-600">
                      {errorText}
                    </p>
                  )}
                  {status === 'sent' && (
                    <p role="status" className="rounded-xl border border-green-100 bg-green-50 px-3 py-2 text-center font-medium text-green-700">
                      ¡Mensaje enviado! Te respondemos por correo lo antes posible.
                    </p>
                  )}
                </div>

                <button type="submit" disabled={status === 'sending'} className="btn-primary w-full">
                  {status === 'sending' ? 'Enviando...' : 'Enviar mensaje'}
                </button>
              </form>
            </div>
          </Reveal>

          <div className="space-y-6">
            <Reveal delay={100}>
              <div className="rounded-3xl bg-white p-8 shadow-aurora-sm ring-1 ring-aurora-navy/5">
                <h2 className="font-display text-2xl font-medium text-aurora-navy">Otras formas de contactarnos</h2>
                <ul className="mt-6 space-y-5">
                  <InfoRow label="Correo" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z">
                    <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-aurora-terracotta">
                      {CONTACT_EMAIL}
                    </a>
                  </InfoRow>
                  <InfoRow label="Teléfono" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z">
                    <a href={`tel:${CONTACT_PHONE.replace(/[^+\d]/g, '')}`} className="hover:text-aurora-terracotta">
                      {CONTACT_PHONE}
                    </a>
                  </InfoRow>
                  <InfoRow label="Horario de atención" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z">
                    Lunes a viernes, de 9:00 a 18:00 (GMT-3)
                  </InfoRow>
                </ul>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="rounded-3xl bg-gradient-to-br from-aurora-navy to-aurora-navyLight p-8 text-white shadow-aurora">
                <h2 className="font-display text-2xl font-medium">¿Necesitás una respuesta rápida?</h2>
                <p className="mt-3 text-sm leading-relaxed text-white/80">
                  Probá con nuestro asistente virtual, el botón con el ícono de chat que ves abajo a la derecha, o revisá las preguntas frecuentes.
                </p>
                <Link
                  to="/faq"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-aurora-navy transition-colors hover:bg-aurora-cream"
                >
                  Ver preguntas frecuentes
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </Reveal>

            <Reveal delay={300}>
              <div className="rounded-3xl bg-white p-8 shadow-aurora-sm ring-1 ring-aurora-navy/5">
                <h2 className="font-display text-2xl font-medium text-aurora-navy">Sobre un club en particular</h2>
                <p className="mt-3 text-sm leading-relaxed text-aurora-navy/65">
                  Los términos, políticas y datos de cada club los encontrás dentro de su perfil. Si tu consulta es sobre un pedido, indicanos el nombre del club así te ayudamos más rápido.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;