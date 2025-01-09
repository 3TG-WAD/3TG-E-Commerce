const formatToVND = (price) => {
  if (!price) return 'Liên hệ';
  
  // Làm tròn số
  const roundedPrice = Math.round(price * 1000);
  
  // Format theo định dạng tiền Việt Nam
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(roundedPrice);
};

module.exports = {
  formatToVND
};
