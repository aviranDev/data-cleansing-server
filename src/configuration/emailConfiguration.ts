import nodemailer from 'nodemailer';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
	host: process.env.EMAIL_HOST,
	port: parseInt(process.env.EMAIL_PORT || '587'),
	secure: false, // true for 465, false for other ports
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

function generateVerificationCode(): string {
	return crypto.randomBytes(3).toString('hex').toUpperCase(); // Example: "A1B2C3"
}

async function sendVerificationEmail(email: string, code: string) {
	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: email,
		subject: 'Verify Your Email Address',
		text: `Your verification code is: ${code}`,
		html: `<p>Your verification code is: <strong>${code}</strong></p>`,
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log(`Verification email sent to ${email}`);
	} catch (error) {
		console.error('Error sending email:', error);
		throw new Error('Could not send verification email.');
	}
}

export {sendVerificationEmail, generateVerificationCode};
