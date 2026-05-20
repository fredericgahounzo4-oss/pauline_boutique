import emailjs from '@emailjs/browser';

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export const sendResetPasswordEmail = (email, code, name) => {
    return emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
            email:      email,        // {{email}}      → destinataire + répondre à
            name:       name || 'Client', // {{name}}   → "Bonjour {{name}}"
            reset_code: code,         // {{reset_code}} → code à 6 chiffres
            app_name:   'Pauline Boutique', // {{app_name}} → nom de l'app
        },
        PUBLIC_KEY
    );
};
