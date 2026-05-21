import emailjs from '@emailjs/browser';

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export const sendResetPasswordEmail = (email, code, name) => {
    return emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
            to_email:   email,   // champ "Envoyer par email" du template
            email:      email,   // {{email}} dans le corps
            name:       name || 'Client',
            reset_code: code,
            app_name:   'Pauline Boutique',
        },
        PUBLIC_KEY
    );
};
