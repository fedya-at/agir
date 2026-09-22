using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces.Repositories
{
    public interface IClientRepository
    {
        Task<IEnumerable<Client>> GetAllAsync();
        Task<Client> GetByIdAsync(Guid id);
        Task<Client> GetByEmailAsync(string email);
        Task<IEnumerable<Client>> SearchAsync(string searchTerm);
        Task<bool> ExistsAsync(Guid id);
        Task<bool> EmailExistsAsync(string email);
        Task AddAsync(Client client);
        Task UpdateAsync(Client client);
        Task DeleteAsync(Guid id);
    }
}
