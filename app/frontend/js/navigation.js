// Main navigation tab handling - ensures URLs use page= parameter

$(function() {
    // Handle main nav-link clicks
    $('.nav-tabs .nav-link').on('click', function (e) {
        e.preventDefault(); // Prevent default href behavior

        const targetId = $(this).attr('href').substring(1); // Remove # from href

        // Update URL with page= format (add area=summary for body tab)
        if (targetId === 'body') {
            window.location.hash = 'page=' + targetId + '&area=summary';
        } else {
            window.location.hash = 'page=' + targetId;
        }

        // Manually show the tab
        $(this).tab('show');
    });

    // Handle URL hash on page load for main navigation
    function handleMainNavFromURL() {
        const urlHash = window.location.hash;

        if (urlHash) {
            const params = new URLSearchParams(urlHash.substring(1)); // Remove # from hash
            const page = params.get('page');

            if (page) {
                // Find and activate the tab
                const tabLink = $(`.nav-tabs .nav-link[href="#${page}"]`);
                if (tabLink.length) {
                    tabLink.tab('show');
                }
            }
        }
    }

    // Handle navigation on page load
    handleMainNavFromURL();

    // Handle browser back/forward buttons
    $(window).on('hashchange', function() {
        handleMainNavFromURL();
    });
});
