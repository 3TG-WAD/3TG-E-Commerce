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
    const baseStyle = `
      font-family: Arial, sans-serif;
      color: #333333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    `;
    
    const buttonStyle = `
      background-color: #007bff;
      border: none;
      border-radius: 10px;
      color: white;
      padding: 12px 25px;
      text-align: center;
      text-decoration: none;
      display: inline-block;
      font-size: 16px;
      margin: 20px 0;
      cursor: pointer;
    `;

    switch (template) {
      case 'activation-email':
        return `
          <div style="${baseStyle}">
            <h1 style="color: #007bff; margin-bottom: 20px;">Welcome to Our Platform!</h1>
            <p style="font-size: 16px; line-height: 1.5;">Thank you for registering. To get started, please activate your account.</p>
            <p style="font-size: 16px; line-height: 1.5;">Click the button below to verify your email address:</p>
            <a href="${context.activationUrl}" style="${buttonStyle}">Activate Account</a>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">If you didn't create an account, you can safely ignore this email.</p>
          </div>
        `;
      case 'reset-password-email':
        return `
          <div style="${baseStyle}">
            <h1 style="color: #007bff; margin-bottom: 20px;">Password Reset Request</h1>
            <p style="font-size: 16px; line-height: 1.5;">We received a request to reset your password.</p>
            <p style="font-size: 16px; line-height: 1.5;">Click the button below to create a new password:</p>
            <a href="${context.resetUrl}" style="${buttonStyle}">Reset Password</a>
            <p style="font-size: 14px; color: #666; margin-top: 20px;">This link will expire in 1 hour.</p>
            <p style="font-size: 14px; color: #666;">If you didn't request this change, you can safely ignore this email.</p>
            <hr style="border: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #999;">For security reasons, we recommend changing your password regularly.</p>
          </div>
        `;
      default:
        return '';
    }
  }
}

module.exports = new Mailer(); 