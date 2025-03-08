// app/api/send-email/route.ts

import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { name ,subject, email, message } = await request.json();
    const adminEmail = process.env.EMAIL_USER;
    // Create a transporter object using SMTP transport
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // Replace with your SMTP server host
      port: 587, // Replace with your SMTP server port
      secure: false, // Use true for port 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER, // Your email user
        pass: process.env.EMAIL_PASS, // Your email password
      },
    });

    // Setup email data
    const mailOptions = {
      from: adminEmail, // Sender address
      to: email, // List of recipients
      subject: "Thank you reaching our Site", // Subject line
      html: getUserEmailTemplate(name), // HTML body
    };

    const mailOptionsAdmin = {
        from: email, // Sender address
        to: adminEmail, // List of recipients
        subject: subject, // Subject line
        html: getCompanyEmailTemplate(name, email, message), // HTML body
        };


    // Send mail
    await transporter.sendMail(mailOptions);
    await transporter.sendMail(mailOptionsAdmin);

    return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ message: 'Failed to send email' }, { status: 500 });
  }
}

function getUserEmailTemplate(name: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4299E1; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f8f8f8; }
            .footer { text-align: center; margin-top: 20px; font-size: 0.8em; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Thank You for Contacting Bounty Quest</h1>
            </div>
            <div class="content">
              <p>Dear ${name},</p>
              <p>Thank you for reaching out to Bounty Quest. We have received your message and appreciate your interest in our services.</p>
              <p>Our team will review your inquiry and get back to you as soon as possible, usually within 1-2 business days.</p>
              <p>In the meantime, feel free to explore our website for more information about ideas and tokens.</p>
              <p>Best regards,<br>The Bounty Quest Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Bounty Quest. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
  
  function getCompanyEmailTemplate(name: string, email: string, message: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4299E1; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f8f8f8; }
            .footer { text-align: center; margin-top: 20px; font-size: 0.8em; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Contact Form Submission</h1>
            </div>
            <div class="content">
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Message:</strong></p>
              <p>${message}</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Bounty Quest. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }