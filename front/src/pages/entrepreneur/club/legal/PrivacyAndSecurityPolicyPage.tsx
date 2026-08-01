import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { getResponseData } from '../../../../api/config';
import LegalContentRenderer from '../../../../components/club/LegalContentRenderer';
import { LegalSection } from '../../../../types/legalSection';

const TermsAndConditionsPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const [sections, setSections] = useState<LegalSection[]>([]);
  const [clubName, setClubName] = useState('');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [legalResponse, clubResponse] = await Promise.all([
          api.get(`/club-legal-content/by-club/${clubId}`),
          api.get(`/clubs/${clubId}`),
        ]);
        setSections(getResponseData(legalResponse).termsAndConditions ?? []);
        setClubName(getResponseData(clubResponse).name ?? '');
      } catch (error) {
        console.error('Error fetching terms:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    if (clubId) fetchContent();
  }, [clubId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-aurora-cream">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-aurora-navy/15 border-t-aurora-terracotta" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="container mx-auto px-4 py-8 text-center min-h-screen bg-aurora-cream">
        <h1 className="font-display text-4xl font-bold text-red-500 mb-4">Club no encontrado</h1>
        <p className="text-lg text-aurora-navy/60 mb-8">No se pudieron cargar los términos y condiciones.</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-aurora-cream">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-aurora-navy hover:text-aurora-terracotta transition-colors duration-200 text-sm font-medium">
        &larr; Volver al Club
      </button>
      <h1 className="font-display text-2xl font-bold text-aurora-navy mb-6 text-center">Términos y Condiciones de {clubName}</h1>
      {sections.length > 0 ? (
        <LegalContentRenderer sections={sections} />
      ) : (
        <p className="text-aurora-navy/50 text-center">Este club aún no ha proporcionado sus términos y condiciones.</p>
      )}
    </div>
  );
};

export default TermsAndConditionsPage;