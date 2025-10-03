const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send email
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `SkillSwap <${process.env.SMTP_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Email could not be sent');
  }
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
  const html = `
    <h1>Welcome to SkillSwap, ${user.name}!</h1>
    <p>We're excited to have you join our community of skill exchangers.</p>
    <p>Start by:</p>
    <ul>
      <li>Completing your profile</li>
      <li>Adding skills you can teach</li>
      <li>Adding skills you want to learn</li>
      <li>Browsing for potential matches</li>
    </ul>
    <p>Happy learning!</p>
  `;

  await sendEmail({
    email: user.email,
    subject: 'Welcome to SkillSwap!',
    html,
  });
};

// Send exchange request notification
const sendExchangeRequestEmail = async (recipient, requester, exchange) => {
  const html = `
    <h1>New Exchange Request</h1>
    <p>Hi ${recipient.name},</p>
    <p>${requester.name} has sent you a skill exchange request!</p>
    <p><strong>They want to learn:</strong> ${exchange.recipientSkill.name}</p>
    <p><strong>They can teach:</strong> ${exchange.requesterSkill.name}</p>
    <p>Log in to SkillSwap to review and respond to this request.</p>
  `;

  await sendEmail({
    email: recipient.email,
    subject: 'New Skill Exchange Request',
    html,
  });
};

// Send session reminder
const sendSessionReminderEmail = async (user, session) => {
  const html = `
    <h1>Session Reminder</h1>
    <p>Hi ${user.name},</p>
    <p>This is a reminder that you have an upcoming session:</p>
    <ul>
      <li><strong>Date:</strong> ${new Date(session.scheduledDate).toLocaleString()}</li>
      <li><strong>Duration:</strong> ${session.duration} minutes</li>
      <li><strong>Type:</strong> ${session.type}</li>
      ${session.location ? `<li><strong>Location:</strong> ${session.location}</li>` : ''}
    </ul>
    <p>See you there!</p>
  `;

  await sendEmail({
    email: user.email,
    subject: 'Session Reminder - SkillSwap',
    html,
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendExchangeRequestEmail,
  sendSessionReminderEmail,
};
