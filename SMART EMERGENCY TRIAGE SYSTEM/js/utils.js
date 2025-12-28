// Utility functions

// Format date to readable string
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
}

// Validate blood pressure format (e.g., "120/80")
function isValidBloodPressure(bp) {
    const bpRegex = /^\d{2,3}\/\d{2,3}$/;
    if (!bpRegex.test(bp)) return false;
    
    const values = bp.split('/');
    const systolic = parseInt(values[0]);
    const diastolic = parseInt(values[1]);
    
    return systolic > 0 && diastolic > 0 && systolic > diastolic;
}

// Debounce function for search inputs
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export functions for use in other modules (for environments like Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatDate,
        isValidBloodPressure,
        debounce
    };
} 
// In a browser environment without a module loader, these are typically global.
// We'll proceed assuming they are accessible globally for the following scripts.