

for (var i = 0; i < prodList.length; i++) {
    var now = new Date();
    var dateTimeFiveMinAgo = new Date(now.getTime() - (5 * 60000));
    var dateTimeFiveHourAgo = new Date(now.getTime() - (5 * 60 * 60000));
    
    try {
        var createdDateTime = new Date(localStorage.getItem("p" + prodList[i]));
        if (localStorage.getItem("p" + prodList[i]) != null && (dateTimeFiveMinAgo > createdDateTime)) { //old prod
            //$("#tr" + prodList[i]).hide(); //todo, this should toggle?
        } else {
            $("#p" + prodList[i]).html("Ny!");
        }

        if (localStorage.getItem("p" + prodList[i]) == null) {
            localStorage.setItem("p" + prodList[i], new Date());
            $("#p" + prodList[i]).html("Ny!");
        }


    } catch (e) {
        console.log(e);
    }
}


/*** Firebase - stuff ***/
var dataRef = new Firebase("https://incandescent-fire-339.firebaseio.com/Product"); // Get a reference to the root of the chat data.

dataRef.on("child_added", function (snapshot) {
    var newProduct = snapshot.val().product;
    Notify(newProduct);
    GetData();
});




/*** Notifications - stuff ***/
function Notify(product) {
    if (!Notification) {
        alert('Desktop notifications not available in your browser. Try Chromium.');
        return;
    }

    if (Notification.permission !== "granted")
        Notification.requestPermission();
    else {
        var notification = new Notification(product.Name, {
            icon: product.ImageUrl,
            body: product.Name + ' ' + product.Price + ':- (' + product.PriceDrop + '%)',
        });

        notification.onclick = function () {
            window.open("http://prisjakt.mrklapp.se/");
        };

    }

}


// request permission on page load
document.addEventListener('DOMContentLoaded', function () {
    if (Notification.permission !== "granted")
        Notification.requestPermission();
});

