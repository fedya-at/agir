using Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IInterventionPartService
    {
        Task<InterventionPartDto> GetByIdAsync(Guid id);
        Task<IEnumerable<InterventionPartDto>> GetByInterventionIdAsync(Guid interventionId);
        Task<InterventionPartDto> AddPartToInterventionAsync(Guid interventionId, CreateInterventionPartDto dto);
        Task UpdateInterventionPartAsync(Guid id, UpdateInterventionPartDto dto);
        Task RemovePartFromInterventionAsync(Guid id);
    }

}
