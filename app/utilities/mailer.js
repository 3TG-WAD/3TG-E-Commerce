const nodemailer = require('nodemailer');

class Mailer {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendMail({ to, subject, template, context }) {
    try {
      // Basic email template
      const html = this.getEmailTemplate(template, context);
      
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html
      });
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send email');
    }
  }

  getEmailTemplate(template, context) {
    // Basic template handling - you can expand this with more sophisticated templating
    switch (template) {
      case 'activation-email':
        return `
          <h1>Account Activation</h1>
          <p>Please click the link below to activate your account:</p>
          <a href="${context.activationUrl}">Activate Account</a>
        `;
      case 'reset-password-email':
        return `
          <h1>Password Reset Request</h1>
          <p>You are receiving this email because you (or someone else) has requested to reset your password.</p>
          <p>Please click the button below to reset your password:</p>
          <a href="${context.resetUrl}" style="
            background-color: #4CAF50;
            border: none;
            color: white;
            padding: 15px 32px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            margin: 4px 2px;
            cursor: pointer;
          ">Reset Password</a>
          <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
          <p>This link will expire in 1 hour.</p>
        `;
      default:
        return '';
    }
  }
}

module.exports = new Mailer(); 