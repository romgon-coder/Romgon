// ============================================
// ERROR HANDLER - Global Error Management
// ============================================

// Suppress MutationObserver errors from build tools
window.addEventListener('error', (event) => {
    if (event.message && event.message.includes('MutationObserver')) {
        console.warn('⚠️ Suppressing MutationObserver error from build tool');
        event.preventDefault();
        return false;
    }
});

// Suppress unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.includes && event.reason.includes('MutationObserver')) {
        console.warn('⚠️ Suppressing MutationObserver promise rejection');
        event.preventDefault();
        return false;
    }
});

console.log('✅ Error handler loaded');
