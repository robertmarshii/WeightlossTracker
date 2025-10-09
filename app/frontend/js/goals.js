// Goals tab navigation and sub-navigation handling (chart periods and progress tabs)

$(function() {
    // Handle chart period button clicks - update URL hash
    $('.chart-period-buttons button').on('click', function() {
        const period = $(this).attr('id').replace('chart-', ''); // e.g., 'weekly', '30days'
        const currentHash = window.location.hash;

        // Update URL with page=goals&tab=period format
        const params = new URLSearchParams(currentHash.substring(1));
        const progressTab = params.get('progress');

        let newHash = 'page=goals&tab=' + period;
        if (progressTab) {
            newHash += '&progress=' + progressTab;
        }
        window.location.hash = newHash;
    });

    // Handle progress tab button clicks - update URL hash
    $('.progress-tab-btn').on('click', function() {
        const progressTab = $(this).attr('data-tab'); // e.g., 'charts', 'stats', 'body-fat'
        const currentHash = window.location.hash;

        // Parse current hash to preserve chart period if it exists
        const params = new URLSearchParams(currentHash.substring(1));
        const currentPeriod = params.get('tab');

        // Build new hash
        let newHash = 'page=goals&tab=' + progressTab;

        // If there was a valid chart period, preserve it in a different parameter
        const chartPeriods = ['weekly', '30days', '90days', 'monthly', 'yearly'];
        if (currentPeriod && chartPeriods.includes(currentPeriod)) {
            newHash = 'page=goals&tab=' + currentPeriod + '&progress=' + progressTab;
        }

        window.location.hash = newHash;
    });

    // Handle URL hash on page load for Goals sub-navigation
    function handleGoalsSubNavFromURL() {
        const urlHash = window.location.hash;

        // Check if URL has page=goals
        if (urlHash.includes('page=goals')) {
            const params = new URLSearchParams(urlHash.substring(1));
            let period = params.get('tab');
            let progressTab = params.get('progress');

            // First ensure Goals tab is active
            $('#goals-tab').tab('show');

            setTimeout(() => {
                // Check if 'tab' parameter is actually a progress tab (charts/stats)
                const progressTabs = ['charts', 'stats'];
                if (period && progressTabs.includes(period)) {
                    // 'tab' is actually a progress tab, treat it as such
                    progressTab = period;
                    period = null;
                }

                // Activate chart period if specified and valid
                if (period) {
                    const buttonId = '#chart-' + period;
                    if ($(buttonId).length) {
                        $(buttonId).click();
                    }
                }

                // Activate progress tab if specified
                if (progressTab) {
                    $(`.progress-tab-btn[data-tab="${progressTab}"]`).click();
                }
            }, 100);
        }
    }

    // Handle sub-navigation on page load
    handleGoalsSubNavFromURL();

    // Handle browser back/forward buttons
    $(window).on('hashchange', function() {
        handleGoalsSubNavFromURL();
    });
});
