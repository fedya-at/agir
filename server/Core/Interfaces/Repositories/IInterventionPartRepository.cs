using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces.Repositories
{
    public interface IInterventionPartRepository
    {
        Task<InterventionPart> GetByIdAsync(Guid id);
        Task<InterventionPart> GetByIdWithPartAsync(Guid id);
        Task<InterventionPart> GetByIdWithDetailsAsync(Guid id);

        Task<IEnumerable<InterventionPart>> GetByInterventionIdAsync(Guid interventionId);
        Task AddAsync(InterventionPart interventionPart);
        Task UpdateAsync(InterventionPart interventionPart);
        Task DeleteAsync(InterventionPart interventionPart);
        Task<bool> ExistsAsync(Guid interventionId, Guid partId);
    }
}
