function getFromDB() {

    var data = new FormData();
    data.append('page', 1);

    return new Promise(function (resolve) {
        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                resolve(JSON.parse(this.responseText));
            }
        }

        xhr.open('POST', '../router.php?controller=get1', true);
        xhr.send(data);
    })
}