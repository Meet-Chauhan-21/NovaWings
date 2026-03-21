# Email Configuration Guide for NovaWings

## Overview
The email notification feature has been successfully added to your NovaWings project. After a successful payment, the system will automatically send a beautifully formatted booking confirmation email to the user's email address.

## What Was Changed

### 1. **Frontend** - Light Mode Fix
   - Fixed FlightCard component (`client/src/components/FlightCard.tsx`) to properly support light mode
   - Replaced all hardcoded hex colors with CSS variables
   - Now tickets display correctly in both light and dark modes

### 2. **Backend** - Email Notification Feature

#### Files Added/Modified:
- **Added**: `server/src/main/java/com/novawings/flights/service/EmailService.java`
  - New service to handle email operations
  - Sends beautifully formatted HTML emails with booking details
  - Runs asynchronously to avoid blocking the payment flow

- **Modified**: `server/pom.xml`
  - Added `spring-boot-starter-mail` dependency

- **Modified**: `server/src/main/java/com/novawings/flights/service/PaymentService.java`
  - Integrated EmailService to send emails after successful booking creation
  - Emails are sent asynchronously and won't fail the payment if there's an email error

- **Modified**: `server/src/main/java/com/novawings/flights/NovaWingsApplication.java`
  - Added `@EnableAsync` annotation to enable asynchronous email sending

- **Modified**: `server/src/main/resources/application.properties`
  - Added email configuration properties

## How to Configure Email

### Option 1: Gmail SMTP (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Google account
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Create an App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the generated 16-character password

3. **Update application.properties**
   ```properties
   spring.mail.username=your-email@gmail.com
   spring.mail.password=your-16-char-app-password
   ```

### Option 2: Using Environment Variables (Recommended for Production)

Set environment variables before running the application:

**Windows (Command Prompt)**:
```cmd
set EMAIL_USERNAME=your-email@gmail.com
set EMAIL_PASSWORD=your-app-password
```

**Windows (PowerShell)**:
```powershell
$env:EMAIL_USERNAME="your-email@gmail.com"
$env:EMAIL_PASSWORD="your-app-password"
```

**Linux/Mac**:
```bash
export EMAIL_USERNAME=your-email@gmail.com
export EMAIL_PASSWORD=your-app-password
```

### Option 3: Other Email Providers

For other email providers (Outlook, Yahoo, etc.), update these properties in `application.properties`:

**Outlook/Office 365**:
```properties
spring.mail.host=smtp.office365.com
spring.mail.port=587
spring.mail.username=your-email@outlook.com
spring.mail.password=your-password
```

**Yahoo Mail**:
```properties
spring.mail.host=smtp.mail.yahoo.com
spring.mail.port=465 or 587
spring.mail.username=your-email@yahoo.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.ssl.enable=true
```

## Email Template Features

The booking confirmation email includes:
- **Professional Design**: Modern, mobile-responsive HTML email
- **Complete Booking Details**:
  - Booking ID (for reference)
  - Flight information (number, airline, route)
  - Departure and arrival times with proper formatting
  - Flight duration
  - Number of seats and seat assignments
  - Meal selection (if applicable)
  - Complete payment breakdown (base fare, taxes, convenience fee, food total)
  - Booking date and time
- **Important Travel Information**: Checklist of things to remember
- **Branded Header and Footer**: Professional NovaWings branding

## Testing the Email Feature

1. **Configure your email credentials** in `application.properties`

2. **Restart the Spring Boot server**:
   ```bash
   cd server
   ./mvnw spring-boot:run
   ```
   Or on Windows:
   ```bash
   mvnw.cmd spring-boot:run
   ```

3. **Complete a test booking**:
   - Go through the booking flow on the frontend
   - Complete payment with Razorpay test credentials
   - Check the email inbox for the confirmation email

## Troubleshooting

### Email Not Sending
- Check if email credentials are correct
- Verify that 2FA is enabled and app password is generated (for Gmail)
- Check application logs for error messages
- Ensure firewall allows SMTP connections on port 587

### Email Goes to Spam
- This is common for new email senders
- Ask users to check their spam folder
- For production, consider using:
  - **SendGrid** (free tier: 100 emails/day)
  - **Amazon SES** (pay per email)
  - **Mailgun** (free tier: 5,000 emails/month)

### Email Formatting Issues
- The email is HTML-based and should render correctly in most email clients
- Test in multiple email clients (Gmail, Outlook, Apple Mail)
- Some corporate email filters might strip styling

## Production Recommendations

1. **Use Environment Variables**: Never commit credentials to version control
2. **Use a Dedicated Email Service**: Consider SendGrid, Amazon SES, or Mailgun for better deliverability
3. **Monitor Email Logs**: Keep track of sent/failed emails
4. **Add Email Queuing**: For high-volume applications, use a message queue (RabbitMQ, Kafka)
5. **Implement Retry Logic**: Add retry mechanism for failed emails

## Security Notes

⚠️ **IMPORTANT**:
- Never commit your email password to Git
- Use environment variables or a secrets manager in production
- The current `application.properties` has placeholder values - replace them!
- Add `application-local.properties` to `.gitignore` if storing local credentials

## Next Steps

1. Configure your email credentials
2. Test the email functionality with a real booking
3. Customize the email template if needed (modify `EmailService.java`)
4. Consider adding more email types:
   - Booking cancellation confirmation
   - Booking modification notifications
   - Flight delay/cancellation alerts
   - Pre-flight reminders (24 hours before departure)

## Support

If you encounter any issues:
1. Check the server logs for detailed error messages
2. Verify email configuration in `application.properties`
3. Test SMTP connection separately to isolate the issue
4. Review Spring Boot Mail documentation: https://docs.spring.io/spring-boot/docs/current/reference/html/io.html#io.email
