using Domain.Entities;
using Domain.Interfaces.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Services.StockAlerts
{
    public class SmartThresholdCalculator
    {
        private readonly IPartRepository _partRepo;

        public SmartThresholdCalculator(IPartRepository partRepo)
        {
            _partRepo = partRepo;
        }

        public async Task<Dictionary<Guid, int>> CalculateDynamicThresholdsAsync()
        {
            var thresholds = new Dictionary<Guid, int>();
            var parts = await _partRepo.GetAllAsync();

            foreach (var part in parts)
            {
                // Placeholder for actual usage calculation logic
                // This would typically involve querying historical sales/usage data
                // For demonstration, let's assume a simple calculation or mock data
                var usage = await _partRepo.GetDailyUsageAsync(part.Id, days: 30);
                var avgDailyUsage = usage.Any() ? usage.Average() : 1;
                thresholds[part.Id] = (int)Math.Ceiling(avgDailyUsage * 2); // 2-day buffer
            }

            return thresholds;
        }
    }
}