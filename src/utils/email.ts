import nodemailer from 'nodemailer';
import { EmailOptions } from '../types';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      });
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendWelcomeEmail(name: string, email: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Our Writing Community!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for joining our writing community! We're excited to have you as part of our literary family.</p>
        <p>You'll receive updates about new stories, essays, and articles as they're published.</p>
        <p>Best regards,<br>The Writing Team</p>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Welcome to Our Writing Community!',
      html,
      text: `Hi ${name}, Welcome to our writing community! Thank you for joining us.`
    });
  }

  async sendSubmissionConfirmation(authorName: string, authorEmail: string, title: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Submission Received</h2>
        <p>Hi ${authorName},</p>
        <p>We've received your submission: "<strong>${title}</strong>"</p>
        <p>Our team will review it and get back to you soon. Thank you for sharing your work with us!</p>
        <p>Best regards,<br>The Editorial Team</p>
      </div>
    `;

    await this.sendEmail({
      to: authorEmail,
      subject: 'Submission Received - ' + title,
      html,
      text: `Hi ${authorName}, We've received your submission: "${title}". Our team will review it soon.`
    });
  }
}

export default new EmailService();