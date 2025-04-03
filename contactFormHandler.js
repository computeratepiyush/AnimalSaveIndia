// Complete Lambda Function Code (Node.js 18.x)
// Save this as 'contactFormHandler.js'

const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: 'ap-south-1' }); // Use your preferred region

exports.handler = async (event) => {
    // Parse the incoming form data
    const formData = JSON.parse(event.body);
    
    // Input validation
    if (!formData.name || !formData.email || !formData.message) {
        return {
            statusCode: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'Missing required fields' })
        };
    }

    try {
        // 1. Send confirmation to the submitter
        await ses.sendEmail({
            Source: 'AnimalSave India <noreply@animalsaveindia.org>',
            Destination: { ToAddresses: [formData.email] },
            Message: {
                Subject: { Data: 'Thank you for contacting AnimalSave India' },
                Body: { 
                    Html: { 
                        Data: `
                        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #5CCC60;">Thank you, ${formData.name}!</h2>
                            <p>We've received your message and our team will get back to you within 24 hours.</p>
                            <p><strong>Your message:</strong><br>${formData.message}</p>
                            <p>For reference, here are the details you provided:</p>
                            <ul>
                                <li><strong>Email:</strong> ${formData.email}</li>
                                ${formData.phone ? `<li><strong>Phone:</strong> ${formData.phone}</li>` : ''}
                                <li><strong>Subject:</strong> ${formData.subject || 'General Inquiry'}</li>
                            </ul>
                            <p>With compassion,<br>The AnimalSave India Team</p>
                        </div>
                        `
                    }
                }
            }
        });

        // 2. Send notification to your team
        await ses.sendEmail({
            Source: 'AnimalSave India <noreply@animalsaveindia.org>',
            Destination: { ToAddresses: ['your-team-email@animalsaveindia.org'] }, // Change this
            Message: {
                Subject: { Data: `New Contact Form Submission: ${formData.subject || 'General Inquiry'}` },
                Body: { 
                    Text: { 
                        Data: `
                        New contact form submission received:
                        
                        Name: ${formData.name}
                        Email: ${formData.email}
                        Phone: ${formData.phone || 'Not provided'}
                        Subject: ${formData.subject || 'General Inquiry'}
                        
                        Message:
                        ${formData.message}
                        
                        Received at: ${new Date().toISOString()}
                        `
                    }
                }
            }
        });

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ message: 'Form submitted successfully' })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};