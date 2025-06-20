import nodemailer from 'nodemailer';

export const sendEmail = async (data: { title: string; content: string }, receiver?: string) => {
  try {
    // Email content setup
    const mailOptions = {
      from: 'contact@inceptionai.ca',
      to: receiver ?? 'contact@inceptionai.ca',
      subject: data.title,
      html: data.content,
    };

    let mailerConfig = {
      host: 'smtp.office365.com',
      secureConnection: true,
      port: 587,
      auth: {
        user: 'contact@inceptionai.ca',
        pass: 'buwsYf-paxxi2-motqof',
      },
    };
    let transporter = nodemailer.createTransport(mailerConfig);

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log('Form submitted. Email sent.');
  } catch (error) {
    console.error('Error processing contact form and CV:', error);
    throw error;
  }
};
