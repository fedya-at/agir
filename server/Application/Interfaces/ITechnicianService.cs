using Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface ITechnicianService
    {
        Task<IEnumerable<TechnicianDto>> GetAllTechniciansAsync();
        Task<TechnicianDto> GetTechnicianByIdAsync(Guid id);
        Task<TechnicianDto> GetTechnicianByEmailAsync(string email);
        Task<IEnumerable<TechnicianDto>> GetActiveTechniciansAsync();
        Task<IEnumerable<TechnicianDto>> SearchTechniciansAsync(string searchTerm);
        Task<TechnicianDto> CreateTechnicianAsync(CreateTechnicianDto technicianDto);
        Task<TechnicianDto> UpdateTechnicianAsync(Guid id, UpdateTechnicianDto technicianDto);
        Task DeleteTechnicianAsync(Guid id);
        Task<TechnicianDto> ActivateTechnicianAsync(Guid id);
        Task<TechnicianDto> DeactivateTechnicianAsync(Guid id);
        Task<IEnumerable<InterventionDto>> GetTechnicianInterventionsAsync(Guid technicianId);
    }
}
