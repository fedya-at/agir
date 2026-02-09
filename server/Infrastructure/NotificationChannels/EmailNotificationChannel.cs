using Application.Interfaces;
using Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Mail;
using System.Net;
using System.Threading.Tasks;

namespace Infrastructure.NotificationChannels
{
    public class EmailNotificationChannel : INotificationChannel
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailNotificationChannel> _logger;

        public EmailNotificationChannel(IConfiguration configuration, ILogger<EmailNotificationChannel> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendAsync(Alert alert)
        {
            try
            {
                var smtpHost = _configuration["SmtpSettings:Host"];
                var smtpPort = int.Parse(_configuration["SmtpSettings:Port"]);
                var smtpUser = _configuration["SmtpSettings:Username"];
                var smtpPass = _configuration["SmtpSettings:Password"];
                var fromEmail = _configuration["SmtpSettings:FromEmail"];

                using var smtp = new SmtpClient(smtpHost, smtpPort)
                {
                    Credentials = new NetworkCredential(smtpUser, smtpPass),
                    EnableSsl = true
                };

                var message = new MailMessage
                {
                    From = new MailAddress(fromEmail),
                    Subject = $"Stock Alert: {alert.PartName}",
                    Body = $"Stock level critical: {alert.CurrentStock} remaining (Threshold: {alert.Threshold}). Message: {alert.Message}",
                    IsBodyHtml = true
                };
                message.To.Add(alert.RecipientEmail);

                await smtp.SendMailAsync(message);
                _logger.LogInformation("Email alert sent for PartId: {PartId} to {Recipient}", alert.PartId, alert.RecipientEmail);
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Failed to send email alert for PartId: {PartId}", alert.PartId);
                throw; // Re-throw to be handled by dispatcher
            }
        }
    }
}