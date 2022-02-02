function saveName(source) {
    if (source.value !== "") {
        localStorage["course_work.username"] = source.value;
    } else {
        window.alert("Введите имя");
    }
}

function requestStartHtml() {
    window.location = "/html/game.html"
}


/*
function loadTable() {
    let table = JSON.parse(localStorage.getItem("tetris.table"));
    if (table === null) {
        table = []
        for (let i = 0; i < 5; i++) {
            table.push([" ", i])
        }
        localStorage.setItem("tetris.table", JSON.stringify(table));
    }
    for (let i = 0; i < 5; i++) {
        let tr0 = document.getElementById("tr-" + i).children[0];
        let tr1 = document.getElementById("tr-" + i).children[1];
        tr0.textContent = table[i][0];
        tr1.textContent = table[i][1];
    }
}

function loadIntoTable(record) {
    let name = localStorage["tetris.username"];
    let table = JSON.parse(localStorage.getItem("tetris.table"));
    if (record <= table[4][1]) {
        return;
    }
    let i = 0
    for (; i < 5; i++) {
        if (record >= table[i][1]) {
            break;
        }
    }
    table.splice(i, 0, [name, record]);
    while (table.length > 5) {
        table.pop();
    }
    flag = false;
    for (let i = 0; i < table.length; i++) {
        if (table[i][0] === name) {
            if (flag) {
                table.splice(i, 1);
                table.push([" ", 0])
                if (i !== 0) {
                    i--;
                }
            } else {
                flag = true;
            }
        }
    }

    localStorage.setItem("tetris.table", JSON.stringify(table));
}


*/