// Importer les fonctions nécessaires depuis les SDK Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";

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

    // Charger les professions depuis le fichier texte
    $.get('professions.txt', function(data) {
        const professions = data.split('\n');
        const professionSelect = $('#profession');
        professions.forEach(function(profession) {
            if (profession.trim() !== "") {
                professionSelect.append(`<option value="${profession.trim()}">${profession.trim()}</option>`);
            }
        });
    });

    $('#load-info').click(function() {
        console.log("Load info clicked");
        var username = $('#username').val();
        if (!username) {
            alert("Veuillez entrer un nom d'utilisateur.");
            return;
        }

        // Récupérer les informations existantes depuis Firebase
        const dbRef = ref(database);
        get(child(dbRef, `qr-codes/${username}`)).then((snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                console.log("Data found:", data);
                $('#name').val(data.name);
                $('#phone').val(data.phone);
                $('#email').val(data.email);
                $('#profession').val(data.profession); // Assurez-vous que la profession est correctement sélectionnée
            } else {
                alert("Aucune information trouvée pour cet utilisateur.");
            }
        }).catch((error) => {
            console.error(error);
        });
    });

    $('#contact-form').submit(function(event) {
        event.preventDefault();
        console.log("Form submitted");

        var username = $('#username').val();
        var name = $('#name').val();
        var phone = $('#phone').val();
        var email = $('#email').val();
        var profession = $('#profession').val();

        // Vérifier si la profession est sélectionnée
        if (!profession) {
            alert("Veuillez sélectionner une profession.");
            return;
        }

        // Encoder les informations pour éviter les problèmes avec les caractères spéciaux
        var contactInfo = `MECARD:N:${encodeURIComponent(name)};TEL:${encodeURIComponent(phone)};EMAIL:${encodeURIComponent(email)};NOTE:${encodeURIComponent(profession)};;`;
        console.log("Encoded Contact Info: ", contactInfo);

        $('#qrcode').empty();
        try {
            var qrcode = new QRCode(document.getElementById("qrcode"), {
                text: contactInfo,
                width: 256,
                height: 256,
                colorDark: "#000000",
                colorLight: "#ffffff"
            });
            console.log("QR code generated");
        } catch (error) {
            console.error("Error generating QR code: ", error);
        }

        setTimeout(() => {
            var img = $('#qrcode').find('img').attr('src');
            if (img) {
                $('#download-link').attr('href', img);
                $('#download-link').attr('download', 'qrcode.png');
                $('#download-link').show();
                console.log("QR code image found: ", img);

                // Enregistrer ou mettre à jour le QR code dans Firebase
                set(ref(database, `qr-codes/${username}`), {
                    name: name,
                    phone: phone,
                    email: email,
                    profession: profession,
                    qrcode: img
                }).then(() => {
                    console.log("Data saved to Firebase");
                }).catch((error) => {
                    console.error(error);
                });
            } else {
                console.error("QR code image not found.");
            }
        }, 1000);
    });
});
