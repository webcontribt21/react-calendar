import CryptoJS from 'crypto-js';

function formatThousands(value) {
  if (value) {
    let formattedValue = value;
    let notation = null;

    if (typeof value === 'string') {
      formattedValue = +value;
    }

    if (formattedValue >= 1.0e3 && formattedValue < 1.0e6) {
      formattedValue = (formattedValue / 1.0e3).toFixed(2);
      notation = 'k';
    } else if (formattedValue >= 1.0e6) {
      formattedValue = (formattedValue / 1.0e6).toFixed(2);
      notation = 'm';
    }

    return [formattedValue, notation];
  }

  return [0, ''];
}

function formatCurrency(amount, digits = 0) {
  if (typeof amount === 'number') {
    return amount.toLocaleString('en-US', {
      currency: 'USD',
      minimumFractionDigits: digits,
      style: 'currency',
    });
  }

  if (!Number.isNaN(amount) || typeof amount === 'string') {
    const amt = parseInt(amount, 10);

    return amt.toLocaleString('en-US', {
      currency: 'USD',
      minimumFractionDigits: digits,
      style: 'currency',
    });
  }

  return 0;
}

function base64url(source) {
  // Encode in classical base64
  let encodedSource = CryptoJS.enc.Base64.stringify(source);

  // Remove padding equal characters
  encodedSource = encodedSource.replace(/=+$/, '');

  // Replace characters according to base64url specifications
  encodedSource = encodedSource.replace(/\+/g, '-');
  encodedSource = encodedSource.replace(/\//g, '_');

  return encodedSource;
}

function jwtEncode(data) {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const stringifiedHeader = CryptoJS.enc.Utf8.parse(
    JSON.stringify(header),
  );
  const encodedHeader = base64url(stringifiedHeader);

  const stringifiedData = CryptoJS.enc.Utf8.parse(
    JSON.stringify(data),
  );
  const encodedData = base64url(stringifiedData);

  return `${encodedHeader}.${encodedData}`;
}

export { formatCurrency, formatThousands, jwtEncode };
