using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces.Repositories;
using Microsoft.Extensions.Logging;


namespace Application.Services.StockAlerts
{
    public class AlertEscalationService : IAlertEscalationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly INotificationDispatcher _notificationDispatcher;
        private readonly ILogger<AlertEscalationService> _logger;

        public AlertEscalationService(
            IUnitOfWork unitOfWork,
            INotificationDispatcher notificationDispatcher,
            ILogger<AlertEscalationService> logger)
        {
            _unitOfWork = unitOfWork;
            _notificationDispatcher = notificationDispatcher;
            _logger = logger;
        }

        public async Task ProcessEscalationsAsync()
        {
            _logger.LogInformation("Processing alert escalations...");
            var unacknowledgedAlerts = await _unitOfWork.Alerts.GetUnacknowledgedOlderThanAsync(TimeSpan.FromHours(24));

            foreach (var alert in unacknowledgedAlerts)
            {
                _logger.LogWarning("Escalating alert for PartId: {PartId}", alert.PartId);
                var escalatedAlert = new Alert
                {
                    PartId = alert.PartId,
                    PartName = alert.PartName,
                    CurrentStock = alert.CurrentStock,
                    Threshold = alert.Threshold,
                    Message = $"ESCALATED: {alert.Message} (Unacknowledged for > 24 hours)",
                    Status = AlertStatus.Escalated,
                    RecipientEmail = alert.RecipientEmail,
                    RecipientPhone = alert.RecipientPhone,
                    IsEscalated = true
                };

                await _notificationDispatcher.DispatchAsync(escalatedAlert);
                alert.MarkEscalated();
                await _unitOfWork.Alerts.UpdateAsync(alert);
            }
            await _unitOfWork.SaveChangesAsync();
            _logger.LogInformation("Alert escalation processing completed.");
        }
    }
}
