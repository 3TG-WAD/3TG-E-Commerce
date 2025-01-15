const formatToVND = (number) => {
  if (!number) return 'Comming Soon';
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(number);
};

module.exports = {
  formatToVND
};
