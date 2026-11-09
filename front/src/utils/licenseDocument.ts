import api from '../api/config';

export const openLicenseDocument = async (licenseId: number): Promise<void> => {
  const popup = window.open('', '_blank');
  try {
    const response = await api.get(`/entrepreneur-licenses/${licenseId}/document`, { responseType: 'blob' });
    const objectUrl = URL.createObjectURL(response.data as Blob);
    if (popup) {
      popup.location.href = objectUrl;
    } else {
      window.open(objectUrl, '_blank');
    }
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
  } catch (error) {
    if (popup) popup.close();
    throw error;
  }
};