using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces.Repositories
{
    public interface ITechnicianRepository
    {
        Task<IEnumerable<Technician>> GetAllAsync();
        Task<Technician> GetByIdAsync(Guid id);
        Task<Technician> GetByEmailAsync(string email);
        Task<IEnumerable<Technician>> GetActiveAsync();
        Task<IEnumerable<Technician>> SearchAsync(string searchTerm);
        Task<bool> ExistsAsync(Guid id);
        Task<bool> EmailExistsAsync(string email);
        Task AddAsync(Technician technician);
        Task UpdateAsync(Technician technician);
        Task DeleteAsync(Guid id);
    }
}
