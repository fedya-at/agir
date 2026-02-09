using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces.Repositories
{
    public interface IAdminRepository
    {
        Task<Admin> GetByIdAsync(Guid id);
        Task<IEnumerable<Admin>> GetAllAsync();
        Task<Admin> AddAsync(Admin admin);
        Task<Admin> UpdateAsync(Admin admin);
        Task<bool> DeleteAsync(Guid id);
       
    }
}
