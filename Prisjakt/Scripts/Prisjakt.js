

var oldList = localStorage.getItem("productList");

if (oldList != null && oldList.length > 0) {
    for (var i = 0; i < newList.length; i++) {
        if (oldList.indexOf(newList[i]) < 0) {
            $("#" + newList[i]).html("Ny!");
           // notify(newList[i].Name);
        }
    }
}

localStorage.setItem("productList", newList);


//function IsNew(id) {

//    if (oldList.indexOf(id) < 0) {
//        $("#" + id).html("Ny!");
//        setTimeout(function () { $("#" + id); }, 60000);
//    }


//}

//checkForNewProducts();

function checkForNewProducts() {
    for (var i = 0; i < newList.length; i++) {
        console.log(newList[i].IsNew);
        if (newList[i].IsNew = 'True') {
           // notify(newList[i].Name);
        }
    }
    setTimeout(function () {
        checkForNewProducts();
    }, 5000);
}


// request permission on page load
document.addEventListener('DOMContentLoaded', function () {
    if (Notification.permission !== "granted")
        Notification.requestPermission();
});

function notify(productName) {
    if (!Notification) {
        alert('Desktop notifications not available in your browser. Try Chromium.');
        return;
    }

    if (Notification.permission !== "granted")
        Notification.requestPermission();
    else {
        var notification = new Notification('Ny produkt med bra pris!', {
            icon: '/images/logo-text-prisjakt.png.ico',
            body: productName,
        });

        notification.onclick = function () {
            window.open("http://prisjakt.mrklapp.se/");
        };

    }

}
