using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces.Repositories
{
    public interface IHistoryRepository
    {
        IQueryable<History> GetAll(); // changed return type
        Task AddAsync(History history);
        Task<IEnumerable<History>> GetByEntityIdAsync(Guid entityId);
        Task<IEnumerable<History>> GetByEntityAsync(string entityName, Guid entityId);
        Task<IEnumerable<History>> GetByUserAsync(Guid userId);
        Task<IEnumerable<History>> GetByEntityNameAsync(string entityName);
        Task ClearAsync();

        // Kept for backward compatibility (consider removing if not needed)
        Task<IEnumerable<History>> GetHistory(string entityName = null, string action = null, Guid? userId = null);

    }
}
