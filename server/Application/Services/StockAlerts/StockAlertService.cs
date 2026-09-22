using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces.Repositories;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Services.StockAlerts
{// Application/Services/StockAlertService.cs
    public class StockAlertService : IStockAlertService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly INotificationDispatcher _notificationDispatcher;
        private readonly ILogger<StockAlertService> _logger;
        private readonly SmartThresholdCalculator _thresholdCalculator;

        public StockAlertService(
            IUnitOfWork unitOfWork,
            INotificationDispatcher notificationDispatcher,
            ILogger<StockAlertService> logger)
        {
            _unitOfWork = unitOfWork;
            _notificationDispatcher = notificationDispatcher;
            _logger = logger;
            _thresholdCalculator = new SmartThresholdCalculator(_unitOfWork.Parts);
        }

        public async Task CheckStockLevelsAsync()
        {
            // Only get parts that are actually low on stock
            var lowStockParts = await _unitOfWork.Parts.GetLowStockAsync();

            foreach (var part in lowStockParts)
            {
                // Calculate threshold (you might want to adjust this based on your business logic)
                var threshold = part.MinStockLevel; // Or use your SmartThresholdCalculator

                // Verify the part is actually below threshold (double-check)
                if (part.StockQuantity <= threshold)
                {
                    var existingAlert = (await _unitOfWork.Alerts.FindAsync(a =>
                        a.PartId == part.Id &&
                        (a.Status == AlertStatus.Pending || a.Status == AlertStatus.Sent)
                    )).FirstOrDefault();

                    if (existingAlert == null)
                    {
                        var alert = new Alert
                        {
                            PartId = part.Id,
                            PartName = part.Name,
                            CurrentStock = part.StockQuantity,
                            Threshold = threshold,
                            Message = $"Critical stock level for {part.Name}. Current: {part.StockQuantity}, Threshold: {threshold}.",
                            RecipientEmail = "procurement@yourcompany.com",
                            RecipientPhone = "+21626485964"
                        };

                        await _unitOfWork.Alerts.AddAsync(alert);
                        await _unitOfWork.SaveChangesAsync();
                        await _notificationDispatcher.DispatchAsync(alert);
                    }
                }
            }
        }
    }
}