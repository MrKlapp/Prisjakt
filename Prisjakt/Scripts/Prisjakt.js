

function GetData() {

    $.getJSON("/Home/GetProducts", function (data) {

        var productList = { products: data };
        console.log(productList);

        var template = $('#template').html();
        Mustache.parse(template); // optional, speeds up future uses
        var rendered = Mustache.render(template, productList);
        $('#productTableBody').html(rendered);
    });

};


function AddNotification(id, name, price, pricedrop, imageUrl) {

    var prod = { Id: id, Name: "" + name + "", Price: price, PriceDrop: pricedrop, ImageUrl: "" + imageUrl + "", Category: "" + name + "",  IsNew: true, Url: "", LastUpdate: new Date() };

    $.ajax({
        url: "/Home/AddProduct",
        type: "POST",
        data: JSON.stringify(prod),
        contentType: "application/json"
    }).done(function () {

        console.log(prod);
        PushToTopAndNotify(prod);
    });
}

function PushToTopAndNotify(product) {

    var productTemplate = $('#template').html();
    var rendered = Mustache.render(productTemplate, { products: product });
    $('#productTableBody').prepend(rendered);

    Notify(product);
}


/*** Firebase - stuff ***/
var dataRef = new Firebase("https://incandescent-fire-339.firebaseio.com/Products"); // Get a reference to the root of the chat data.

dataRef.on("child_added", function (snapshot) {
    var newProduct = snapshot.val().product;
    PushToTopAndNotify(newProduct);
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










//for (var i = 0; i < prodList.length; i++) {
//    var now = new Date();
//    var dateTimeFiveMinAgo = new Date(now.getTime() - (5 * 60000));
//    var dateTimeFiveHourAgo = new Date(now.getTime() - (5 * 60 * 60000));

//    try {
//        var createdDateTime = new Date(localStorage.getItem("p" + prodList[i]));
//        if (localStorage.getItem("p" + prodList[i]) != null && (dateTimeFiveMinAgo > createdDateTime)) { //old prod
//            //$("#tr" + prodList[i]).hide(); //todo, this should toggle?
//        } else {
//            $("#p" + prodList[i]).html("Ny!");
//        }

//        if (localStorage.getItem("p" + prodList[i]) == null) {
//            localStorage.setItem("p" + prodList[i], new Date());
//            $("#p" + prodList[i]).html("Ny!");
//        }


//    } catch (e) {
//        console.log(e);
//    }
//}
