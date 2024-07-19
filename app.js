// Importer les fonctions nécessaires depuis les SDK Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getDatabase, ref, set, get, child, onValue } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";

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

$(document).ready(function() {
    console.log("Document is ready");

    $('#load-info').click(function() {
        console.log("Load info clicked");
        var username = $('#username').val();
        if (username) {
            console.log("Username entered:", username);
            // Récupérer les informations existantes depuis Firebase
            const dbRef = ref(database);
            get(child(dbRef, `qr-codes/${username}`)).then((snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    console.log("Data found:", data);
                    $('#name').val(data.name);
                    $('#phone').val(data.phone);
                    $('#email').val(data.email);
                } else {
                    alert("Aucune information trouvée pour cet utilisateur.");
                }
            }).catch((error) => {
                console.error(error);
            });
        } else {
            alert("Veuillez entrer un nom d'utilisateur.");
        }
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
                loadUserData();  // Rechargez les données après l'ajout
            }).catch((error) => {
                console.error(error);
            });
        }, 500);
    });

    // Fonction pour charger et afficher les données des utilisateurs
    function loadUserData() {
        const dbRef = ref(database, 'qr-codes/');
        onValue(dbRef, (snapshot) => {
            const usersList = $('#users-list');
            usersList.empty();
            snapshot.forEach((childSnapshot) => {
                const userData = childSnapshot.val();
                usersList.append(`<li class="list-group-item">
                    <strong>Nom d'utilisateur:</strong> ${childSnapshot.key} <br>
                    <strong>Nom:</strong> ${userData.name} <br>
                    <strong>Téléphone:</strong> ${userData.phone} <br>
                    <strong>Email:</strong> ${userData.email}
                </li>`);
            });
        });
    }

    // Charger les données des utilisateurs au chargement de la page
    loadUserData();
});
