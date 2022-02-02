var table = {
    data: [],
    load: function () {
        let request = new XMLHttpRequest();
        request.open("GET", "/api/records", true);
        request.responseType = "json";
        request.onload = function () {
            table.data = request.response;
        };
        request.send();
    },
    addRecord(record) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", '/api/records', true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.onreadystatechange = function () { // Call a function when the state changes.
            if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                console.log("post done");
            }
        }
        xhr.send(JSON.stringify(record));
    }
}