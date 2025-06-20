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
            
            logger.info(f"Email sent successfully to {to_email}. Status: {response.status_code}")
            return response.status_code == 202
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
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
    
    def send_vendor_approval_notification(self, vendor_email: str, vendor_name: str, approved: bool):
        """Send vendor approval/rejection notification to vendor"""
        if approved:
            subject = "🎉 Your Enosi Vendor Account Has Been Approved!"
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background-color: #10b981; color: white; padding: 20px; text-align: center; }}
                    .content {{ padding: 20px; background-color: #f9f9f9; }}
                    .button {{ background-color: #e11d48; color: white; padding: 12px 24px; text-decoration: none; 
                              border-radius: 5px; display: inline-block; margin: 10px 0; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Welcome to Enosi!</h1>
                        <p>Your vendor account has been approved</p>
                    </div>
                    <div class="content">
                        <p>Hi {vendor_name},</p>
                        <p>Great news! Your Enosi vendor account has been approved and is now active.</p>
                        <p>You can now access your vendor dashboard and start showcasing your services to couples planning their dream weddings.</p>
                        <div style="text-align: center;">
                            <a href="https://d3d31e89-3c08-4101-817f-edcf53de07ce.preview.emergentagent.com/vendor-dashboard" class="button">
                                Access Your Dashboard
                            </a>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """
        else:
            subject = "Update on Your Enosi Vendor Application"
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background-color: #ef4444; color: white; padding: 20px; text-align: center; }}
                    .content {{ padding: 20px; background-color: #f9f9f9; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Application Update</h1>
                    </div>
                    <div class="content">
                        <p>Hi {vendor_name},</p>
                        <p>Thank you for your interest in joining Enosi. After reviewing your application, we're unable to approve your vendor account at this time.</p>
                        <p>If you have any questions or would like to discuss this decision, please contact us at enosiaustralia@gmail.com</p>
                    </div>
                </div>
            </body>
            </html>
            """
        
        return self.send_email(vendor_email, subject, html_content)

# Create a global instance
email_service = EmailService()