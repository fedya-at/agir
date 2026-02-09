using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.StockAlert
{
    public class StockAlertWorker : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<StockAlertWorker> _logger;

        public StockAlertWorker(IServiceScopeFactory scopeFactory, ILogger<StockAlertWorker> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("StockAlertWorker running.");
            while (!stoppingToken.IsCancellationRequested)
            {
                using var scope = _scopeFactory.CreateScope();
                var stockService = scope.ServiceProvider.GetRequiredService<IStockAlertService>();

                try
                {
                    await stockService.CheckStockLevelsAsync();
                    await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken); // Check every 5 mins
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Stock check failed in StockAlertWorker");
                    await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken); // Retry faster on failure
                }
            }
        }
    }
}
