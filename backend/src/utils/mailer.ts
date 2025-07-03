import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false, // true si port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendWelcomeEmail(to: string, displayName: string) {
  console.log('Sending email to:', to);

  await transporter.sendMail({
    from: '"PromptPilot" <noreply@paqueriaud.fr>',
    to,
    subject: 'Bienvenue sur PromptPilot !',
    text: `Bonjour ${displayName},\n\nMerci de t'être inscrit sur PromptPilot ! 🚀\n\nBienvenue dans l'application de gestion de prompts systèmes et de modèles d'IA.\n\nBonne découverte !`,
    html: `<p>Bonjour <strong>${displayName}</strong>,</p><p>Merci de t'être inscrit sur PromptPilot ! 🚀</p><p>Bienvenue dans l'application de gestion de prompts systèmes et de modèles d'IA.</p><p>Bonne découverte !</p>`,
  }).then(() => {
    console.log('Email sent successfully');
  }).catch((error) => {
    console.error('Error sending email:', error);
  });
}
