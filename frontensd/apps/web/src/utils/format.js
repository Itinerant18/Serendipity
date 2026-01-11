/**
 * Format a number as Indian Currency (INR)
 * @param {number} amount - The amount to format
 * @param {boolean} showSymbol - Whether to show the currency symbol (default: true)
 * @returns {string} Formatted string (e.g., "₹1,23,456.00")
 */
export const formatCurrency = (amount, showSymbol = true) => {
    if (amount === undefined || amount === null) return showSymbol ? "₹0.00" : "0.00";

    // Ensure amount is a number
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

    // Check for invalid numbers
    if (isNaN(numAmount)) return showSymbol ? "₹0.00" : "0.00";

    try {
        const formatter = new Intl.NumberFormat('en-IN', {
            style: showSymbol ? 'currency' : 'decimal',
            currency: 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        return formatter.format(numAmount);
    } catch (error) {
        // Fallback
        return (showSymbol ? "₹" : "") + numAmount.toFixed(2);
    }
};

/**
 * Format large numbers for charts (e.g., 1.5k, 1.2L) for Indian Context
 * @param {number} num - The number to format
 * @returns {string} Formatted string
 */
export const formatCompactNumber = (num) => {
    if (!num) return "0";

    if (num >= 10000000) { // 1 Crore
        return (num / 10000000).toFixed(1) + 'Cr';
    }
    if (num >= 100000) { // 1 Lakh
        return (num / 100000).toFixed(1) + 'L';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
};
