export const generateIdPendaftaran = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  // Auto increment 3 digit (simplified - in real app would come from database)
  const increment = Math.floor(Math.random() * 999) + 1;
  const incrementStr = String(increment).padStart(3, '0');
  
  return `RJ${year}${month}${day}${incrementStr}`;
};

export const generateNoRekamMedik = (): string => {
  // Auto increment 6 digit (simplified - in real app would come from database)
  const increment = Math.floor(Math.random() * 999999) + 1;
  return String(increment).padStart(6, '0');
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};