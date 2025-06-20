from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.api_key = os.environ.get('SENDGRID_API_KEY')
        self.sender_email = os.environ.get('SENDER_EMAIL', 'noreply@enosi.com.au')
        self.admin_email = os.environ.get('ADMIN_EMAIL', 'enosiaustralia@gmail.com')
        
        if not self.api_key:
            logger.warning("SendGrid API key not found in environment variables")
            
    def send_email(self, to_email: str, subject: str, html_content: str, plain_content: Optional[str] = None):
        """Send an email using SendGrid"""
        if not self.api_key:
            logger.error("Cannot send email: SendGrid API key not configured")
            return False
            
        try:
            message = Mail(
                from_email=self.sender_email,
                to_emails=to_email,
                subject=subject,
                html_content=html_content,
                plain_text_content=plain_content
            )
            
            sg = SendGridAPIClient(self.api_key)
            response = sg.send(message)
            
            logger.info(f"SendGrid response status: {response.status_code}")
            logger.info(f"SendGrid response body: {response.body}")
            logger.info(f"SendGrid response headers: {response.headers}")
            
            if response.status_code == 202:
                logger.info(f"Email sent successfully to {to_email}")
                return True
            else:
                logger.error(f"Email failed to send. Status: {response.status_code}, Body: {response.body}")
                return False
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            logger.error(f"Exception type: {type(e).__name__}")
            return False
    
    def send_vendor_registration_notification(self, vendor_data: dict):
        """Send vendor registration notification to admin"""
        subject = f"New Vendor Registration: {vendor_data.get('business_name', 'Unknown Business')}"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #e11d48; color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 20px; background-color: #f9f9f9; }}
                .vendor-details {{ background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px; }}
                .label {{ font-weight: bold; color: #e11d48; }}
                .button {{ background-color: #e11d48; color: white; padding: 12px 24px; text-decoration: none; 
                          border-radius: 5px; display: inline-block; margin: 10px 0; }}
                .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 New Vendor Registration</h1>
                    <p>A new vendor has registered on Enosi</p>
                </div>
                
                <div class="content">
                    <h2>Vendor Details</h2>
                    
                    <div class="vendor-details">
                        <p><span class="label">Business Name:</span> {vendor_data.get('business_name', 'N/A')}</p>
                        <p><span class="label">Contact Name:</span> {vendor_data.get('first_name', '')} {vendor_data.get('last_name', '')}</p>
                        <p><span class="label">Email:</span> {vendor_data.get('email', 'N/A')}</p>
                        <p><span class="label">Phone:</span> {vendor_data.get('phone', 'N/A')}</p>
                        <p><span class="label">User ID:</span> {vendor_data.get('id', 'N/A')}</p>
                        <p><span class="label">Registration Date:</span> {vendor_data.get('created_at', 'N/A')}</p>
                    </div>
                    
                    <p>This vendor account is pending approval and requires manual review before activation.</p>
                    
                    <div style="text-align: center;">
                        <a href="https://d3d31e89-3c08-4101-817f-edcf53de07ce.preview.emergentagent.com/admin" class="button">
                            Review in Admin Dashboard
                        </a>
                    </div>
                </div>
                
                <div class="footer">
                    <p>This is an automated notification from Enosi Wedding Marketplace</p>
                    <p>Please do not reply to this email</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        plain_content = f"""
        New Vendor Registration - Enosi Wedding Marketplace
        
        A new vendor has registered and requires approval:
        
        Business Name: {vendor_data.get('business_name', 'N/A')}
        Contact Name: {vendor_data.get('first_name', '')} {vendor_data.get('last_name', '')}
        Email: {vendor_data.get('email', 'N/A')}
        Phone: {vendor_data.get('phone', 'N/A')}
        User ID: {vendor_data.get('id', 'N/A')}
        Registration Date: {vendor_data.get('created_at', 'N/A')}
        
        Please review this vendor in the admin dashboard:
        https://d3d31e89-3c08-4101-817f-edcf53de07ce.preview.emergentagent.com/admin
        
        This is an automated notification from Enosi Wedding Marketplace.
        """
        
        return self.send_email(self.admin_email, subject, html_content, plain_content)
    
    def send_vendor_registration_confirmation(self, vendor_email: str, vendor_name: str, business_name: str):
        """Send registration confirmation email to vendor"""
        subject = f"Registration Received - {business_name}"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #e11d48; color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 20px; background-color: #f9f9f9; }}
                .info-box {{ background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px; }}
                .label {{ font-weight: bold; color: #e11d48; }}
                .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📋 Registration Received</h1>
                    <p>Thank you for applying to join Enosi</p>
                </div>
                
                <div class="content">
                    <p>Hi {vendor_name},</p>
                    
                    <p>Thank you for registering <strong>{business_name}</strong> with Enosi Wedding Marketplace!</p>
                    
                    <div class="info-box">
                        <h3>What happens next?</h3>
                        <ul>
                            <li>✅ Your application has been received</li>
                            <li>⏳ Our team will manually review your business details</li>
                            <li>📧 You'll receive an email notification within 24-48 hours</li>
                            <li>🎉 Once approved, you can access your vendor dashboard</li>
                        </ul>
                    </div>
                    
                    <div class="info-box">
                        <p><strong>Your Registration Details:</strong></p>
                        <p><span class="label">Business Name:</span> {business_name}</p>
                        <p><span class="label">Contact Email:</span> {vendor_email}</p>
                        <p><span class="label">Status:</span> Pending Review</p>
                    </div>
                    
                    <p>We appreciate your interest in joining our wedding marketplace and look forward to potentially welcoming you to our vendor community.</p>
                    
                    <p>If you have any questions during the review process, please contact us at james@enosiweddings.com</p>
                </div>
                
                <div class="footer">
                    <p>This is an automated confirmation from Enosi Wedding Marketplace</p>
                    <p>Please do not reply to this email</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        plain_content = f"""
        Registration Received - Enosi Wedding Marketplace
        
        Hi {vendor_name},
        
        Thank you for registering {business_name} with Enosi Wedding Marketplace!
        
        What happens next?
        - Your application has been received
        - Our team will manually review your business details  
        - You'll receive an email notification within 24-48 hours
        - Once approved, you can access your vendor dashboard
        
        Your Registration Details:
        Business Name: {business_name}
        Contact Email: {vendor_email}
        Status: Pending Review
        
        We appreciate your interest in joining our wedding marketplace and look forward to potentially welcoming you to our vendor community.
        
        If you have any questions during the review process, please contact us at james@enosiweddings.com
        
        This is an automated confirmation from Enosi Wedding Marketplace.
        """
        
        return self.send_email(vendor_email, subject, html_content, plain_content)

# Create a global instance
email_service = EmailService()