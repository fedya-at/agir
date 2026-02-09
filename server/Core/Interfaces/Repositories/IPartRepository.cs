using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces.Repositories
{
    public interface IPartRepository
    {
        Task<IEnumerable<Part>> GetAllAsync();
        Task<Part> GetByIdAsync(Guid id);
        Task<IEnumerable<Part>> GetByIdsAsync(IEnumerable<Guid> ids);
        Task<IEnumerable<Part>> SearchAsync(string searchTerm);
        Task<IEnumerable<Part>> GetLowStockAsync();
        Task<bool> ExistsAsync(Guid id);
        Task AddAsync(Part part);
        Task UpdateAsync(Part part);
        Task DeleteAsync(Guid id);
        Task<IEnumerable<double>> GetDailyUsageAsync(Guid partId, int days);

    }
}
