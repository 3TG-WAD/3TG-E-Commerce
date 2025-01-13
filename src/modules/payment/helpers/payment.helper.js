/**
 * Generate a simple transaction code
 * @param {Object} params
 * @param {number} params.itemCount - Number of items
 * @param {string} params.buyerName - Name of the buyer
 * @returns {string} Transaction code
 */
const generateTransactionCode = ({ itemCount, buyerName }) => {
    // Lấy timestamp hiện tại (unix timestamp)
    const timestamp = Math.floor(Date.now() / 1000);
    
    // Lấy 2 chữ số của số lượng item
    const itemStr = itemCount.toString().padStart(2, '0');
    
    // Lấy chữ cái đầu của tên người mua
    const buyerInitial = (buyerName || 'C').charAt(0).toUpperCase();
    
    // Format: [Timestamp]-[Items]-[BuyerInitial]
    return `${timestamp}-${itemStr}-${buyerInitial}`;
};

module.exports = {
    generateTransactionCode
};