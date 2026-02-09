using Application.Interfaces;
using Domain.Entities;
using Microsoft.Extensions.Logging;


namespace Application.Services.StockAlerts
{
    public class NotificationDispatcher : INotificationDispatcher
    {
        private readonly IEnumerable<INotificationChannel> _channels;
        private readonly ILogger<NotificationDispatcher> _logger;

        public NotificationDispatcher(IEnumerable<INotificationChannel> channels, ILogger<NotificationDispatcher> logger)
        {
            _channels = channels;
            _logger = logger;
        }

        public async Task DispatchAsync(Alert alert)
        {
            _logger.LogInformation("Dispatching alert for PartId: {PartId}", alert.PartId);
            var tasks = _channels.Select(async ch =>
            {
                try
                {
                    await ch.SendAsync(alert);
                    _logger.LogInformation("Alert sent via {ChannelType} for PartId: {PartId}", ch.GetType().Name, alert.PartId);
                }
                catch (System.Exception ex)
                {
                    _logger.LogError(ex, "Failed to send alert via {ChannelType} for PartId: {PartId}", ch.GetType().Name, alert.PartId);
                }
            });
            await Task.WhenAll(tasks);
            alert.MarkSent();
        }
    }
}
