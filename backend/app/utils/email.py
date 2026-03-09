import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

def send_email(to_email: str, subject: str, html_content: str, reply_to: str = None):
    try:
        if not settings.MAIL_USERNAME or not settings.MAIL_PASSWORD:
            print("Mailtrap credentials not set. Skipping email send.")
            return False

        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = settings.MAIL_FROM
        message["To"] = to_email
        if reply_to:
            message["Reply-To"] = reply_to

        part = MIMEText(html_content, "html")
        message.attach(part)

        with smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT) as server:
            server.starttls() 
            server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
            server.sendmail(settings.MAIL_FROM, to_email, message.as_string())
        
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False
