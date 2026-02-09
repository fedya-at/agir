using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace Domain.Interfaces.Repositories
{
    public interface IAlertRepository
    {
        Task<Alert> GetPendingAlertByPartIdAsync(Guid partId);
        Task<IEnumerable<Alert>> GetActiveAlertsAsync();
        Task AddAsync(Alert alert);
        Task UpdateAsync(Alert alert);
        Task<Alert> GetByIdAsync(Guid id);
        Task<IEnumerable<Alert>> FindAsync(Expression<Func<Alert, bool>> predicate);
        Task<IEnumerable<Alert>> GetUnacknowledgedOlderThanAsync(TimeSpan timeSpan);

    }
}