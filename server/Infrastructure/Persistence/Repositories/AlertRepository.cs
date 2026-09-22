using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces.Repositories;
using Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Twilio.Rest.Trunking.V1;

namespace Infrastructure.Persistence.Repositories
{
    public class AlertRepository : IAlertRepository // If not inheriting from GenericRepository
    {

        private readonly ApplicationDbContext _context;

        public AlertRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Alert> GetPendingAlertByPartIdAsync(Guid partId)
        {
            return await _context.Alerts
                .FirstOrDefaultAsync(a => a.PartId == partId && a.Status == AlertStatus.Pending);
        }

        public async Task<IEnumerable<Alert>> GetActiveAlertsAsync()
        {
            // Active alerts are typically those that are Pending, Sent, or Escalated
            return await _context.Alerts
                .Where(a => a.Status == AlertStatus.Pending || a.Status == AlertStatus.Sent || a.Status == AlertStatus.Escalated)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();
        }

        // Implement other necessary methods if not using a generic repository
        public async Task AddAsync(Alert alert)
        {
            await _context.Alerts.AddAsync(alert);
        }

        public async Task UpdateAsync(Alert alert)
        {
            _context.Alerts.Update(alert);
        }

        public async Task<Alert> GetByIdAsync(Guid id)
        {
            return await _context.Alerts
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public Task<IEnumerable<Alert>> FindAsync(Expression<Func<Alert, bool>> predicate)
        {
            return _context.Alerts
                .Where(predicate)
                .AsNoTracking()
                .ToListAsync()
                .ContinueWith(task => (IEnumerable<Alert>)task.Result); 
        }

        public Task<IEnumerable<Alert>> GetUnacknowledgedOlderThanAsync(TimeSpan timeSpan)
        {
            return _context.Alerts
                .Where(a => a.Status == AlertStatus.Pending &&
                            (DateTime.UtcNow - a.CreatedAt) > timeSpan)
                .AsNoTracking()
                .ToListAsync()
                .ContinueWith(task => (IEnumerable<Alert>)task.Result);
        }
    }
}