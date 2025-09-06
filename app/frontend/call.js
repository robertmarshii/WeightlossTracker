$( document ).ready(function() {

    getData();

    
})

    async function getData() {

        let result = await getFromDB(); 
        console.log(result);
        $(document.body).append(JSON.stringify(result));

    }