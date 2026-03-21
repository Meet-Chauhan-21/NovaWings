# Gmail Email Authentication Error - Fix Guide

## Error: "Username and Password not accepted"

This error occurs because Gmail has strict security requirements. Here's how to fix it:

---

## ✅ Solution 1: Generate a New App Password (Recommended)

### Step 1: Verify 2-Factor Authentication is Enabled
1. Go to: https://myaccount.google.com/security
2. Under "How you sign in to Google", ensure **2-Step Verification** is ON
3. If it's OFF, click on it and enable it

### Step 2: Generate a New App Password
1. Go to: https://myaccount.google.com/apppasswords
2. If you don't see this option, make sure 2FA is enabled first
3. Select app: **Mail**
4. Select device: **Other (Custom name)** and type "NovaWings"
5. Click **Generate**
6. You'll get a 16-character password like: `abcd efgh ijkl mnop`

### Step 3: Update application.properties
Copy the password **WITHOUT SPACES**:

```properties
spring.mail.username=meetchauhan9915@gmail.com
spring.mail.password=abcdefghijklmnop
```

Example with your email:
```properties
spring.mail.username=${EMAIL_USERNAME:meetchauhan9915@gmail.com}
spring.mail.password=${EMAIL_PASSWORD:your-new-16-char-password}
```

---

## ⚠️ Common Mistakes to Avoid

1. **Don't use your regular Gmail password** - It won't work!
2. **Remove all spaces** from the app password
3. **Don't include the dashes** that Google shows
4. **Ensure 2FA is enabled** - App passwords only work with 2FA
5. **Generate a new password** if you're unsure about the old one

---

## 🔧 Solution 2: Use Gmail "Less Secure App Access" (NOT Recommended)

**Note**: Google has deprecated this option for most accounts. It's better to use App Passwords.

If you still want to try:
1. Go to: https://myaccount.google.com/lesssecureapps
2. Turn ON "Allow less secure apps"
3. Update `application.properties`:
```properties
spring.mail.username=meetchauhan9915@gmail.com
spring.mail.password=your-regular-gmail-password
```

---

## 🚀 Solution 3: Use Environment Variables (Best for Production)

Instead of putting credentials in the file:

### For Windows (Command Prompt):
```cmd
set EMAIL_USERNAME=meetchauhan9915@gmail.com
set EMAIL_PASSWORD=your-app-password-without-spaces
cd server
mvnw spring-boot:run
```

### For Windows (PowerShell):
```powershell
$env:EMAIL_USERNAME="meetchauhan9915@gmail.com"
$env:EMAIL_PASSWORD="your-app-password-without-spaces"
cd server
./mvnw spring-boot:run
```

---

## 🧪 Solution 4: Test Email Configuration

Add this test endpoint to verify email works:

Create: `server/src/main/java/com/novawings/flights/controller/TestController.java`

```java
package com.novawings.flights.controller;

import com.novawings.flights.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @Autowired
    private EmailService emailService;

    @GetMapping("/email")
    public String testEmail(@RequestParam String to) {
        try {
            // Create a test booking-like object
            com.novawings.flights.model.Booking testBooking =
                com.novawings.flights.model.Booking.builder()
                    .id("TEST-123")
                    .userName("Test User")
                    .userEmail(to)
                    .flightNumber("NW-001")
                    .airlineName("Test Airlines")
                    .source("Mumbai")
                    .destination("Delhi")
                    .numberOfSeats(1)
                    .baseFlightFare(5000.0)
                    .taxes(900.0)
                    .convenienceFee(199.0)
                    .foodTotal(500.0)
                    .totalPrice(6599.0)
                    .build();

            emailService.sendBookingConfirmationEmail(testBooking);
            return "Email sent successfully to: " + to;
        } catch (Exception e) {
            return "Failed to send email: " + e.getMessage();
        }
    }
}
```

Test it: `http://localhost:8080/api/test/email?to=meetchauhan9915@gmail.com`

---

## 📋 Quick Checklist

- [ ] 2-Factor Authentication is enabled on Gmail account
- [ ] Generated a NEW App Password from Google
- [ ] Copied the password WITHOUT spaces
- [ ] Updated `application.properties` with the new password
- [ ] Restarted the Spring Boot server
- [ ] Tested with a real booking

---

## 🔍 Troubleshooting

### Error Still Persists?

1. **Check Gmail Activity**:
   - Go to: https://myaccount.google.com/notifications
   - Look for blocked sign-in attempts

2. **Enable Display Unlock Captcha**:
   - Go to: https://accounts.google.com/DisplayUnlockCaptcha
   - Click "Continue"

3. **Check Account Security**:
   - Gmail might block sign-ins from new locations/apps
   - Check your email for security alerts from Google

4. **Try a Different Email** (for testing):
   - Use a test email service like Mailtrap.io
   - Or create a fresh Gmail account specifically for the app

---

## 🎯 Recommended Configuration (application.properties)

```properties
# Email Configuration (Gmail SMTP)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=${EMAIL_USERNAME:meetchauhan9915@gmail.com}
spring.mail.password=${EMAIL_PASSWORD:your-16-char-app-password}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
spring.mail.properties.mail.smtp.connectiontimeout=5000
spring.mail.properties.mail.smtp.timeout=5000
spring.mail.properties.mail.smtp.writetimeout=5000

# Enable debug mode to see detailed SMTP logs (optional)
# spring.mail.properties.mail.debug=true
```

---

## ✨ After Fixing

Once you update the correct App Password:

1. Restart the server: `mvnw spring-boot:run`
2. Make a test booking
3. Check your email inbox
4. You should receive a beautiful booking confirmation! 🎉

---

## 🆘 Still Need Help?

If none of these solutions work:

1. **Check the full error log** for more details
2. **Try enabling debug mode**:
   ```properties
   spring.mail.properties.mail.debug=true
   logging.level.org.springframework.mail=DEBUG
   ```
3. **Consider using a different email provider** temporarily (Outlook, SendGrid, etc.)
