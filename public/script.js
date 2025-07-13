document.addEventListener('DOMContentLoaded', function() {
    const quoteTypeSelect = document.getElementById('quoteType');
    const dialectTypeSelect = document.getElementById('dialectType');
    const translateBtn = document.getElementById('translateBtn');
    const loading = document.getElementById('loading');
    const quoteDisplay = document.getElementById('quoteDisplay');
    const error = document.getElementById('error');
    const originalQuote = document.getElementById('originalQuote');
    const translatedQuote = document.getElementById('translatedQuote');
    const errorMessage = document.getElementById('errorMessage');

    // Enable/disable translate button based on selection
    quoteTypeSelect.addEventListener('change', function() {
        translateBtn.disabled = !this.value;
    });

    // Handle translate button click
    translateBtn.addEventListener('click', async function() {
        const selectedType = quoteTypeSelect.value;
        const selectedDialect = dialectTypeSelect.value;
        
        if (!selectedType) {
            showError('Please select a quote type');
            return;
        }

        // Show loading state
        showLoading();
        hideError();
        hideQuoteDisplay();

        try {
            const response = await fetch(`/api/quote?type=${selectedType}&dialect=${selectedDialect}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }

            // Display the quotes
            originalQuote.textContent = data.original;
            translatedQuote.textContent = data.translated;
            showQuoteDisplay();

        } catch (err) {
            console.error('Error fetching quote:', err);
            showError('Failed to fetch quote. Please try again.');
        } finally {
            hideLoading();
        }
    });

    function showLoading() {
        loading.style.display = 'block';
        translateBtn.disabled = true;
    }

    function hideLoading() {
        loading.style.display = 'none';
        translateBtn.disabled = false;
    }

    function showQuoteDisplay() {
        quoteDisplay.style.display = 'block';
    }

    function hideQuoteDisplay() {
        quoteDisplay.style.display = 'none';
    }

    function showError(message) {
        errorMessage.textContent = message;
        error.style.display = 'block';
    }

    function hideError() {
        error.style.display = 'none';
    }
}); 