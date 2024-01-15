import nodemailer from 'nodemailer';

// smtp configuration

// email body

// send email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: +process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const emailSender = async (obj) => {
  try {
    const info = await transporter.sendMail(obj);
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.log(error);
  }
};

export const sendEmailVerificationLinkEmail = ({ email, fName, url }) => {
  const body = {
    from: `"Tech Gear" <${process.env.SMTP_USER}>`, // sender address
    to: email, // list of receivers
    subject: 'Follow the instructions to verify your account ', // Subject line
    text: `Hello ${fName}, please follow the link to verify your account ${url} \n\n Regards, Tech Gear`, // plain text body
    html: `<p>Hello ${fName}</p>
    <br />
    <br />
    
    <p>Thank you for creating account with us. Click the button below to verify your account</p>
    
    <p>
        <a href= ${url}>
        <button style= 'background: green; padding: 2rem; color: white, fonnt-weight: bold'>Verify</button></a>
    </p>
    
    <br />
    <p>
        If the above button doesn't work, copy paste the following link in your browser ${url}
    </p>
    <br />
    <br />
    -----------
    
    <p>
        Regards,
        <br />
        Tech Gear
        <br />
        www.mysite.com
    
    
    </p>`, // html body
  };
  emailSender(body);
};

export const sendEmailVerifyNotification = ({ email, fName }) => {
  const body = {
    from: `"Tech Gear" <${process.env.SMTP_USER}>`, // sender address
    to: email, // list of receivers
    subject: 'Your email has been  verified ', // Subject line
    text: `Hello ${fName}, Your email has been  verified. You may login now.`, // plain text body
    html: `<p>Hello ${fName}</p>
      <br />
      <br />
      
      <p>Thank you for your time to verify your email.  Your email has been  verified. You may login now.</p>
      
      
      
      <br />
      
      <br />
      <br />
      -----------
      
      <p>
          Regards,
          <br />
          Tech Gear
          <br />
          www.mysite.com
      
      
      </p>`, // html body
  };
  emailSender(body);
};

export const sendOtpEmail = ({ email, fName, otp }) => {
  const body = {
    from: `"Tech Gear" <${process.env.SMTP_USER}>`, // sender address
    to: email, // list of receivers
    subject: 'Your OTP for password reset ', // Subject line
    text: `Hello ${fName}, Here is your OTP ${otp}.`, // plain text body
    html: `<p>Hello ${fName}</p>
      <br />
      <br />
      
      <p>Here is your OTP to reset your password</p>
      <p style="font-size:3rem, color:red>${otp}</p>
      
      
      
      <br />
      
      <br />
      <br />
      -----------
      
      <p>
          Regards,
          <br />
          Tech Gear
          <br />
          www.mysite.com
      
      
      </p>`, // html body
  };
  emailSender(body);
};
