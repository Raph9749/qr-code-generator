// Configuration Firebase (remplacez par vos propres clés)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);

// Référence à la base de données
const database = firebase.database();

$(document).ready(function() {
    $('#load-info').click(function() {
        var username = $('#username').val();
        if (username) {
            // Récupérer les informations existantes depuis Firebase
            database.ref('qr-codes/' + username).once('value').then(function(snapshot) {
                var data = snapshot.val();
                if (data) {
                    $('#name').val(data.name);
                    $('#phone').val(data.phone);
                    $('#email').val(data.email);
                } else {
                    alert("Aucune information trouvée pour cet utilisateur.");
                }
            });
        } else {
            alert("Veuillez entrer un nom d'utilisateur.");
        }
    });

    $('#contact-form').submit(function(event) {
        event.preventDefault();
        
        var username = $('#username').val();
        var name = $('#name').val();
        var phone = $('#phone').val();
        var email = $('#email').val();
        var contactInfo = `MECARD:N:${name};TEL:${phone};EMAIL:${email};;`;
        
        $('#qrcode').empty();
        var qrcode = new QRCode(document.getElementById("qrcode"), {
            text: contactInfo,
            width: 256,
            height: 256
        });

        setTimeout(() => {
            var img = $('#qrcode').find('img').attr('src');
            $('#download-link').attr('href', img);
            $('#download-link').attr('download', 'qrcode.png');
            $('#download-link').show();

            // Enregistrer ou mettre à jour le QR code dans Firebase
            database.ref('qr-codes/' + username).set({
                name: name,
                phone: phone,
                email: email,
                qrcode: img
            });
        }, 500);
    });
});
