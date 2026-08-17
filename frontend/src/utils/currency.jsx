// Currency utility functions for INR formatting

// INR Currency Icon Component
export const INRIcon = () => (
  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2zm0 8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Format amount to INR (Indian Rupees)
export const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount * 83); // Convert USD to INR (approximate rate)
};

// Format amount to INR with decimal places
export const formatINRWithDecimals = (amount, decimals = 2) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(amount * 83); // Convert USD to INR (approximate rate)
};

// Convert USD amount to INR (for calculations)
export const convertUSDToINR = (usdAmount) => {
  return usdAmount * 83;
};

// Convert INR amount to USD (for reverse calculations)
export const convertINRToUSD = (inrAmount) => {
  return inrAmount / 83;
};

// Format amount without currency symbol (for CSV exports)
export const formatINRPlain = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount * 83);
};
