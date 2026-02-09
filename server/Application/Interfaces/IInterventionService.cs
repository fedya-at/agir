using Application.DTOs;
using Domain.Entities;
using Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IInterventionService
    {
        Task<IEnumerable<InterventionDto>> GetAllInterventionsAsync();
        Task<InterventionDto> GetInterventionByIdAsync(Guid id);
        Task<IEnumerable<InterventionDto>> GetInterventionsByClientIdAsync(Guid clientId);

        Task<IEnumerable<InterventionDto>> GetInterventionsByTechnicianIdAsync(Guid technicianId);
        Task<IEnumerable<InterventionDto>> GetInterventionsByStatusAsync(InterventionStatus status);
        Task<IEnumerable<InterventionDto>> GetInterventionsByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<InterventionDto> CreateInterventionAsync(CreateInterventionDto interventionDto);
        Task<InterventionDto> UpdateInterventionAsync(Guid id, UpdateInterventionDto interventionDto);
        Task DeleteInterventionAsync(Guid id);
        Task<InterventionDto> AssignTechnicianAsync(Guid interventionId, Guid technicianId);
        Task<InterventionDto> UpdateInterventionStatusAsync(Guid id, InterventionStatus newStatus);
        Task<InterventionDto> AddPartToInterventionAsync(Guid interventionId, AddInterventionPartDto partDto);
        Task<InterventionDto> RemovePartFromInterventionAsync(Guid interventionId, Guid partId);
        Task<InterventionDto> UpdateInterventionPartQuantityAsync(Guid interventionId, Guid partId, int quantity);

    }


}
