// Capitalize first letter of each word
export const capitalizeWords = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Format phone number for display
export const formatPhoneDisplay = (number) => {
  if (!number) return '—';
  const cleaned = String(number).replace(/\D/g, '');
  
  let formatted = cleaned;
  if (cleaned.length === 10 && cleaned.startsWith('9')) {
    formatted = '0' + cleaned;
  }
  
  if (formatted.length === 11) {
    return `(${formatted.substring(0, 4)}) ${formatted.substring(4, 7)}-${formatted.substring(7)}`;
  }
  
  return number;
};

// Format phone number as user types
export const formatPhoneInput = (value) => {
  const cleaned = value.replace(/\D/g, '');
  const limited = cleaned.substring(0, 11);
  
  let formatted = limited;
  if (limited.length === 10 && limited.startsWith('9')) {
    formatted = '0' + limited;
  }
  
  if (formatted.length <= 4) {
    return formatted;
  } else if (formatted.length <= 7) {
    return `(${formatted.substring(0, 4)}) ${formatted.substring(4)}`;
  } else {
    return `(${formatted.substring(0, 4)}) ${formatted.substring(4, 7)}-${formatted.substring(7, 11)}`;
  }
};

// Extract raw phone number from formatted string
export const extractPhoneNumber = (formatted) => {
  if (!formatted) return '';
  return formatted.replace(/\D/g, '');
};

// Format full name (firstName + lastName)
export const formatFullName = (firstName, lastName) => {
  const formattedFirst = capitalizeWords(firstName);
  const formattedLast = capitalizeWords(lastName);
  return `${formattedFirst} ${formattedLast}`.trim();
};