using Application.Interfaces;
using Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;
using Twilio;
using Twilio.Rest.Api.V2010.Account;

namespace Infrastructure.NotificationChannels
{
    public class SmsNotificationChannel : INotificationChannel
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<SmsNotificationChannel> _logger;

        public SmsNotificationChannel(IConfiguration configuration, ILogger<SmsNotificationChannel> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendAsync(Alert alert)
        {
            try
            {
                var accountSid = _configuration["TwilioSettings:AccountSid"];
                var authToken = _configuration["TwilioSettings:AuthToken"];
                var fromPhoneNumber = _configuration["TwilioSettings:FromPhoneNumber"];

                TwilioClient.Init(accountSid, authToken);

                var message = await MessageResource.CreateAsync(
                    body: $"URGENT: {alert.PartName} stock low ({alert.CurrentStock}). Threshold: {alert.Threshold}. Message: {alert.Message}",
                    from: new Twilio.Types.PhoneNumber(fromPhoneNumber),
                    to: new Twilio.Types.PhoneNumber(alert.RecipientPhone)
                );

                _logger.LogInformation("SMS alert sent for PartId: {PartId} to {Recipient}. SID: {MessageSid}", alert.PartId, alert.RecipientPhone, message.Sid);
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Failed to send SMS alert for PartId: {PartId}", alert.PartId);
                throw; // Re-throw to be handled by dispatcher
            }
        }
    }
}