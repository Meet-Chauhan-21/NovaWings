package com.novawings.flights.service;

import com.novawings.flights.model.Booking;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.name:NovaWings}")
    private String appName;

    /**
     * Send booking confirmation email asynchronously.
     */
    @Async
    public void sendBookingConfirmationEmail(Booking booking) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, appName);
            helper.setTo(booking.getUserEmail());
            helper.setSubject("Booking Confirmed - " + booking.getFlightNumber() + " | " + appName);

            String emailContent = buildBookingConfirmationEmail(booking);
            helper.setText(emailContent, true);

            mailSender.send(message);
            log.info("Booking confirmation email sent to: {}", booking.getUserEmail());

        } catch (MessagingException e) {
            log.error("Failed to send booking confirmation email to: {}", booking.getUserEmail(), e);
        } catch (Exception e) {
            log.error("Unexpected error while sending email", e);
        }
    }

    /**
     * Build HTML email content for booking confirmation.
     */
    private String buildBookingConfirmationEmail(Booking booking) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm");
        String bookingDate = booking.getBookingDate() != null
            ? booking.getBookingDate().format(dateFormatter)
            : LocalDateTime.now().format(dateFormatter);

        String departureTime = "N/A";
        String arrivalTime = "N/A";

        try {
            if (booking.getDepartureTimeStr() != null && !booking.getDepartureTimeStr().isEmpty()) {
                departureTime = LocalDateTime.parse(booking.getDepartureTimeStr()).format(dateFormatter);
            }
        } catch (Exception e) {
            log.warn("Could not parse departure time: {}", booking.getDepartureTimeStr());
        }

        try {
            if (booking.getArrivalTime() != null && !booking.getArrivalTime().isEmpty()) {
                arrivalTime = LocalDateTime.parse(booking.getArrivalTime()).format(dateFormatter);
            }
        } catch (Exception e) {
            log.warn("Could not parse arrival time: {}", booking.getArrivalTime());
        }

        String selectedSeatsStr = booking.getSelectedSeats() != null && !booking.getSelectedSeats().isEmpty()
            ? String.join(", ", booking.getSelectedSeats())
            : "Will be assigned at check-in";

        StringBuilder foodOrdersHtml = new StringBuilder();
        if (booking.getFoodOrders() != null && !booking.getFoodOrders().isEmpty()) {
            foodOrdersHtml.append("<div style='margin-top: 15px;'>");
            foodOrdersHtml.append("<h3 style='color: #1a1a2e; margin-bottom: 10px;'>Meal Selection:</h3>");
            foodOrdersHtml.append("<ul style='color: #5a6170; line-height: 1.8;'>");
            booking.getFoodOrders().forEach(food -> {
                foodOrdersHtml.append("<li>").append(food).append("</li>");
            });
            foodOrdersHtml.append("</ul>");
            foodOrdersHtml.append("</div>");
        } else if (booking.isMealSkipped()) {
            foodOrdersHtml.append("<div style='margin-top: 15px;'>");
            foodOrdersHtml.append("<p style='color: #5a6170;'>Meal: <strong>Not selected</strong></p>");
            foodOrdersHtml.append("</div>");
        }

        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; background-color: #f5f7fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                <table width="100%%" cellpadding="0" cellspacing="0" style="background-color: #f5f7fa; padding: 40px 20px;">
                    <tr>
                        <td align="center">
                            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">

                                <!-- Header -->
                                <tr>
                                    <td style="background: linear-gradient(135deg, #F97316 0%%, #EA580C 100%%; padding: 30px; text-align: center;">
                                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">%s</h1>
                                        <p style="color: rgba(255,255,255,0.95); margin: 8px 0 0 0; font-size: 16px;">Booking Confirmation</p>
                                    </td>
                                </tr>

                                <!-- Success Message -->
                                <tr>
                                    <td style="padding: 30px; text-align: center; background-color: rgba(16, 185, 129, 0.05);">
                                        <div style="display: inline-block; background-color: #10B981; color: #ffffff; padding: 10px 20px; border-radius: 25px; font-weight: 600;">
                                            ✓ Booking Confirmed
                                        </div>
                                        <p style="color: #5a6170; margin-top: 15px; font-size: 15px;">
                                            Dear <strong>%s</strong>, your flight has been successfully booked!
                                        </p>
                                    </td>
                                </tr>

                                <!-- Booking Details -->
                                <tr>
                                    <td style="padding: 30px;">

                                        <!-- Booking ID -->
                                        <div style="background-color: #f5f7fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                                            <p style="margin: 0; color: #7a8290; font-size: 13px;">Booking ID</p>
                                            <p style="margin: 5px 0 0 0; color: #1a1a2e; font-size: 18px; font-weight: 700; font-family: 'Courier New', monospace;">%s</p>
                                        </div>

                                        <!-- Flight Details -->
                                        <h2 style="color: #1a1a2e; font-size: 20px; margin: 0 0 20px 0; padding-bottom: 10px; border-bottom: 2px solid #f0f2f5;">Flight Details</h2>

                                        <table width="100%%" cellpadding="8" cellspacing="0">
                                            <tr>
                                                <td style="color: #7a8290; font-size: 14px; width: 40%%;">Flight Number</td>
                                                <td style="color: #1a1a2e; font-size: 14px; font-weight: 600;">%s</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #7a8290; font-size: 14px;">Airline</td>
                                                <td style="color: #1a1a2e; font-size: 14px; font-weight: 600;">%s</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #7a8290; font-size: 14px;">Route</td>
                                                <td style="color: #1a1a2e; font-size: 14px; font-weight: 600;">%s → %s</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #7a8290; font-size: 14px;">Departure</td>
                                                <td style="color: #1a1a2e; font-size: 14px; font-weight: 600;">%s</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #7a8290; font-size: 14px;">Arrival</td>
                                                <td style="color: #1a1a2e; font-size: 14px; font-weight: 600;">%s</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #7a8290; font-size: 14px;">Duration</td>
                                                <td style="color: #1a1a2e; font-size: 14px; font-weight: 600;">%s</td>
                                            </tr>
                                        </table>

                                        <!-- Passenger Details -->
                                        <h2 style="color: #1a1a2e; font-size: 20px; margin: 30px 0 20px 0; padding-bottom: 10px; border-bottom: 2px solid #f0f2f5;">Passenger Details</h2>

                                        <table width="100%%" cellpadding="8" cellspacing="0">
                                            <tr>
                                                <td style="color: #7a8290; font-size: 14px; width: 40%%;">Number of Seats</td>
                                                <td style="color: #1a1a2e; font-size: 14px; font-weight: 600;">%d</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #7a8290; font-size: 14px;">Seat Numbers</td>
                                                <td style="color: #1a1a2e; font-size: 14px; font-weight: 600;">%s</td>
                                            </tr>
                                        </table>

                                        %s

                                        <!-- Payment Summary -->
                                        <h2 style="color: #1a1a2e; font-size: 20px; margin: 30px 0 20px 0; padding-bottom: 10px; border-bottom: 2px solid #f0f2f5;">Payment Summary</h2>

                                        <table width="100%%" cellpadding="8" cellspacing="0">
                                            <tr>
                                                <td style="color: #7a8290; font-size: 14px;">Base Fare</td>
                                                <td style="color: #1a1a2e; font-size: 14px; text-align: right;">₹%.2f</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #7a8290; font-size: 14px;">Taxes & Fees</td>
                                                <td style="color: #1a1a2e; font-size: 14px; text-align: right;">₹%.2f</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #7a8290; font-size: 14px;">Convenience Fee</td>
                                                <td style="color: #1a1a2e; font-size: 14px; text-align: right;">₹%.2f</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #7a8290; font-size: 14px;">Food Total</td>
                                                <td style="color: #1a1a2e; font-size: 14px; text-align: right;">₹%.2f</td>
                                            </tr>
                                            <tr style="border-top: 2px solid #f0f2f5;">
                                                <td style="color: #1a1a2e; font-size: 16px; padding-top: 12px; font-weight: 700;">Total Amount Paid</td>
                                                <td style="color: #F97316; font-size: 18px; font-weight: 700; text-align: right; padding-top: 12px;">₹%.2f</td>
                                            </tr>
                                        </table>

                                        <!-- Booking Date -->
                                        <p style="color: #7a8290; font-size: 13px; margin-top: 20px; text-align: center;">
                                            Booked on: %s
                                        </p>

                                    </td>
                                </tr>

                                <!-- Important Info -->
                                <tr>
                                    <td style="padding: 20px 30px; background-color: rgba(249, 115, 22, 0.05); border-top: 1px solid #f0f2f5;">
                                        <h3 style="color: #F97316; margin: 0 0 10px 0; font-size: 16px;">Important Information</h3>
                                        <ul style="color: #5a6170; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                                            <li>Please arrive at the airport at least 2 hours before departure</li>
                                            <li>Carry a valid government-issued photo ID</li>
                                            <li>Web check-in opens 48 hours before departure</li>
                                            <li>Baggage allowance as per airline policy</li>
                                        </ul>
                                    </td>
                                </tr>

                                <!-- Footer -->
                                <tr>
                                    <td style="padding: 30px; text-align: center; background-color: #1a1a2e;">
                                        <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 14px;">
                                            Thank you for choosing %s!
                                        </p>
                                        <p style="color: rgba(255,255,255,0.6); margin: 10px 0 0 0; font-size: 12px;">
                                            Have a safe and pleasant journey!
                                        </p>
                                    </td>
                                </tr>

                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """,
            appName,
            booking.getUserName() != null ? booking.getUserName() : "Valued Customer",
            booking.getId(),
            booking.getFlightNumber() != null ? booking.getFlightNumber() : "N/A",
            booking.getAirlineName() != null ? booking.getAirlineName() : "N/A",
            booking.getSource() != null ? booking.getSource() : "N/A",
            booking.getDestination() != null ? booking.getDestination() : "N/A",
            departureTime,
            arrivalTime,
            booking.getDuration() != null ? booking.getDuration() : "N/A",
            booking.getNumberOfSeats(),
            selectedSeatsStr,
            foodOrdersHtml.toString(),
            booking.getBaseFlightFare(),
            booking.getTaxes(),
            booking.getConvenienceFee(),
            booking.getFoodTotal(),
            booking.getTotalPrice(),
            bookingDate,
            appName
        );
    }
}
