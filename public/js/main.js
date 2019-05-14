
const request = indexedDB.open('todo', 1);
const requestDone = indexedDB.open('done', 1);
let id = 0;

function addDataJsonTodo(e){
    fetch("/todo", {
        method: "POST",
        headers: {
            "Accept" : "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(e)
    });
}

function addDataJsonDone(e){
    fetch("/done", {
        method: "POST",
        headers: {
            "Accept" : "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(e)
    })
}

function deleteDataJsonTodo(e){
    fetch("/todo/"+e, {
        method: "DELETE",
        headers: {
            "Accept" : "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({id: e})
    })
}

function deleteDataJsonDone(e){
    fetch("/done/"+e, {
        method: "DELETE",
        headers: {
            "Accept" : "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({id: e})
    })
}

request.onupgradeneeded = function (e) {
    var db = e.target.result;

    if(!db.objectStoreNames.contains('todo')) {
        var os = db.createObjectStore('todo', {keyPath: "id", autoIncrement:false});
        os.createIndex('name', 'name', {unique:false});
    }
};

request.onsuccess = function (e) {
    console.log('Success: Opened DB..');
    db = e.target.result;
    showTodos();
};


request.onerror = function (e) {
    console.log('Error: Could Not Open Database');
};

requestDone.onupgradeneeded = function (e) {
    var dbdone = e.target.result;

    if(!dbdone.objectStoreNames.contains('done')) {
        var os = dbdone.createObjectStore('done', {keyPath: "id", autoIncrement:false});
        os.createIndex('name', 'name', {unique:false});
    }
};

requestDone.onsuccess = function (e) {
    console.log('Success: Opened Done DB..');
    dbdone = e.target.result;
    showDone();
};

requestDone.onerror = function (e) {
    console.log('Error: Could Not Open Database');
};


function addTodo() {
    const name = document.getElementById('item').value;
    ++id;
    var transaction = db.transaction('todo', "readwrite");
    var store = transaction.objectStore('todo');


    if(name != ''){
        var todo = {
        name: name,
        id: id
        };
        var request = store.add(todo);

        request.onsuccess = function (e) {
            document.getElementById('item').value = '';
            console.log(todo);
            addDataJsonTodo(todo);
            showTodos();
        };

        request.onerror = function (e) {
            console.log("Error: ", e.target.error.name);
        }
    }
    
}

function showTodos(e) {
    const todo = document.getElementById('todo');

    var transaction = db.transaction('todo', "readonly")
    var store = transaction.objectStore('todo');

    var index = store.index('name');

    var removeIcon = '<i class="fa fa-trash-o" aria-hidden="true"></i>';
    var completeIcon = '<i class="fa fa-check-square-o" id="todobox" aria-hidden="true"></i>';
    var output = '';
    index.openCursor().onsuccess = function (e) {
        var cursor = e.target.result;
        if(cursor) {
            output += '<li>' + cursor.value.name + '<div class="buttons">' + '<button name="delete" class="remove" onclick="deleteItem(' + cursor.value.id + ')">' + removeIcon + '</button>' + '<button name="complete" class="complete" onclick="fulfillTodo(' + cursor.value.id + ')">' + completeIcon + '</button>' + '</li>';
            cursor.continue();
        }
        todo.innerHTML = output;
    }
}

function deleteItem(id) {
    var store = db.transaction('todo', "readwrite").objectStore('todo');
    var request = store.delete(id);

    request.onsuccess = function () {
        console.log('todo deleted');
        console.log(id);
        deleteDataJsonTodo(id);
        showTodos();
        showDone();
    };

    request.onerror = function (e) {
        console.log('Error', e.target.error.name);
    };
}


function showDone(e) {
    const todoCompleted = document.getElementById('completed');

    var transactionDone = dbdone.transaction('done', "readonly");
    var store = transactionDone.objectStore('done');
    var index = store.index('name');

    var removeIcon = '<i class="fa fa-trash-o" aria-hidden="true"></i>';
    var output = '';
    index.openCursor().onsuccess = function (e) {
        var cursor = e.target.result;
        if(cursor) {
            output += '<li>' + cursor.value.name + '<div class="buttons">' + '<button name="delete" class="remove" onclick="deleteDoneItem(' + cursor.value.id + ')">' + removeIcon + '</button>' + '</li>';
            cursor.continue();
        }
        todoCompleted.innerHTML = output;
    }
}


function fulfillTodo(id) {
    var transaction = db.transaction('todo');
    var todoObject = transaction.objectStore('todo');
    var toDo = todoObject.get(id);

    toDo.onsuccess = function () {
        processTodo(toDo);
    }
}

function processTodo(todo) {
    var transactionDone = dbdone.transaction('done', 'readwrite');
    var store = transactionDone.objectStore('done');
    deleteItem(todo.result.id);
    var name = todo.result.name;
    var id = todo.result.id;
    console.log(name);
    var item = ({
        name: name,
        id: id
    });
    store.add(item);
    addDataJsonDone(item);
    return transactionDone.complete;
}

function deleteDoneItem(id) {
    var transaction = dbdone.transaction('done', "readwrite");
    var store = transaction.objectStore('done');
    var request = store.delete(id);

    request.onsuccess = function () {
        console.log('todo deleted');
        deleteDataJsonDone(id);
        showTodos();
        showDone();
    };

    request.onerror = function (e) {
        console.log('Error', e.target.error.name);
    };
}