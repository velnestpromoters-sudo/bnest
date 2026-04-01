exports.sendOTPEmail = async (to, otp) => {
  const data = {
    template_id: process.env.EMAILJS_TEMPLATE_ID,
    user_id: process.env.EMAILJS_PUBLIC_KEY,
    accessToken: process.env.EMAILJS_PRIVATE_KEY,
    template_params: {
      to_email: to,      // Ensure your EmailJS template uses {{to_email}} in the "To" field
      otp_code: otp,     // Ensure your template body uses {{otp_code}}
      message: `Your OTP is ${otp}. It is valid for 5 minutes.` // Optional fallback variable
    }
  };

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
       const errText = await response.text();
       throw new Error(`EmailJS Error: ${errText}`);
    }
  } catch (error) {
    console.error("EmailJS Backend Failure:", error);
    throw error;
  }
};
