// Body tab navigation and sub-tab handling

$(function() {
    // Handle Smart Data sub-tab clicks
    $('#smartDataTabs a[data-toggle="tab"]').on('click', function (e) {
        const subtabId = $(this).attr('href').substring(1); // Remove # from href
        window.location.hash = 'page=body&tab=' + subtabId;
    });

    // Handle Measurements sub-tab clicks
    $('#measurementsTabs a[data-toggle="tab"]').on('click', function (e) {
        const subtabId = $(this).attr('href').substring(1); // Remove # from href
        window.location.hash = 'page=body&tab=' + subtabId;
    });

    // Handle Calipers sub-tab clicks
    $('#calipersTabs a[data-toggle="tab"]').on('click', function (e) {
        const subtabId = $(this).attr('href').substring(1); // Remove # from href
        window.location.hash = 'page=body&tab=' + subtabId;
    });

    // Handle URL hash on page load for sub-tabs
    function handleSubTabFromURL() {
        const urlHash = window.location.hash;

        // Check if URL has page=body and tab parameter
        if (urlHash.includes('page=body') && urlHash.includes('tab=')) {
            const params = new URLSearchParams(urlHash.substring(1)); // Remove # from hash
            const subtab = params.get('tab');

            if (subtab) {
                // First ensure Body tab is active
                $('#body-tab').tab('show');

                // Then activate the specific sub-tab
                setTimeout(() => {
                    // Check all three tab groups
                    let tabLink = $('#smartDataTabs a[href="#' + subtab + '"]');
                    if (!tabLink.length) {
                        tabLink = $('#measurementsTabs a[href="#' + subtab + '"]');
                    }
                    if (!tabLink.length) {
                        tabLink = $('#calipersTabs a[href="#' + subtab + '"]');
                    }
                    if (tabLink.length) {
                        tabLink.tab('show');
                    }
                }, 100);
            }
        } else if (urlHash.includes('page=body') && !urlHash.includes('tab=')) {
            // If just page=body without tab parameter, ensure Body tab is active
            // But keep default tabs active (muscle-history, neck-history, caliper-chest-history)
            $('#body-tab').tab('show');
        }
    }

    // Handle sub-tab navigation on page load
    handleSubTabFromURL();

    // Handle browser back/forward buttons
    $(window).on('hashchange', function() {
        handleSubTabFromURL();
    });
});
