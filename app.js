// Importer les fonctions nécessaires depuis les SDK Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

// Votre configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBDhvMF__q7Btu2uSlIAk5g1DuzMpJC794",
    authDomain: "qr-code-generator-7d7fa.firebaseapp.com",
    projectId: "qr-code-generator-7d7fa",
    storageBucket: "qr-code-generator-7d7fa.appspot.com",
    messagingSenderId: "762081265650",
    appId: "1:762081265650:web:b3472fc96c420e5bc8cd6b",
    measurementId: "G-J70Z9QJ4R4",
    databaseURL: "https://qr-code-generator-7d7fa-default-rtdb.firebaseio.com/"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

$(document).ready(function() {
    console.log("Document is ready");

    // Fonction de connexion pour les administrateurs
    function adminLogin(email, password) {
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Connexion réussie
                const user = userCredential.user;
                console.log('Admin logged in:', user);
                // Montrer la section admin et cacher la section de connexion
                $('#login-section').hide();
                $('#admin-section').show();
            })
            .catch((error) => {
                console.error('Login failed:', error);
            });
    }

    // Gérer la soumission du formulaire de connexion
    $('#login-form').submit(function(event) {
        event.preventDefault();
        const email = $('#admin-email').val();
        const password = $('#admin-password').val();
        adminLogin(email, password);
    });

    $('#contact-form').submit(function(event) {
        event.preventDefault();
        console.log("Form submitted");

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

            console.log("QR code generated:", img);

            // Enregistrer ou mettre à jour le QR code dans Firebase
            set(ref(database, 'qr-codes/' + username), {
                name: name,
                phone: phone,
                email: email,
                qrcode: img
            }).then(() => {
                console.log("Data saved to Firebase");
            }).catch((error) => {
                console.error(error);
            });
        }, 500);
    });
});
