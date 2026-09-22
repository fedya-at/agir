using Domain.Entities;
using Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces.Repositories
{
    public interface IInterventionRepository
    {
        Task<IEnumerable<Intervention>> GetAllAsync();
        Task<Intervention> GetByIdAsync(Guid id);
        Task<IEnumerable<Intervention>> GetByClientIdAsync(Guid clientId);
        Task<IEnumerable<Intervention>> GetByTechnicianIdAsync(Guid technicianId);
        Task<IEnumerable<Intervention>> GetByStatusAsync(InterventionStatus status);
        Task<IEnumerable<Intervention>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<bool> ExistsAsync(Guid id);
        Task AddAsync(Intervention intervention);
        Task UpdateAsync(Intervention intervention);
        Task DeleteAsync(Guid id);
  
    }

}
