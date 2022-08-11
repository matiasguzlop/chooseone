const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
    service: "gmail",
    port: 456,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER, // generated ethereal user
        pass: process.env.EMAIL_PASS, // generated ethereal password
    },
});

const sendEmailActivationEmail = (data) => {
    const message = {
        from: process.env.EMAIL_USER,
        to: data.email,
        subject: "Activa tu cuenta de TIDE OTA Updater",
        html: `
        Hola, para activar tu cuenta visita el siguiente link: 
        <br><a href='http://${process.env.MAIN_FRONT_URL}/activateAccount?token=${data.token}'>Activa tu cuenta</a>
        <br><br> Saludos!
        <br><span style='font-size:0.6em;'>Este mensaje fue generado automáticamente.</span>`,
    };
    return transporter.sendMail(message);
};

const sendRecoveryEmail = ({ email, token }) => {
    const message = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Recuperación de contraseña de TIDE OTA Updater",
        html: `
            Hola, para recuperar tu contraseña visita el siguiente link:
            <br><a href='http://${process.env.MAIN_FRONT_URL}/accountRecovery?token=${token}'>Recupera tu contraseña</a>
            <br><br>Saludos!
            <br><span style='font-size:0.6em;'>Este mensaje fue generado automáticamente.</span>`
    };
    return transporter.sendMail(message);
};

module.exports = {
    sendEmailActivationEmail,
    sendRecoveryEmail
};