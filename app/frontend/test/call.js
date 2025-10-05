$( document ).ready(function() {

    getData();

    
})

    async function getData() {
        if (window.coverage) window.coverage.logFunction('getData', 'test/call.js');

        let result = await getFromDB(); 
        debugLog(result);
        $(document.body).append(JSON.stringify(result));

    }