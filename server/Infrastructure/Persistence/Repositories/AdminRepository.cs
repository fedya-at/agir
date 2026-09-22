using Domain.Entities;
using Domain.Interfaces.Repositories;
using Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Persistence.Repositories
{
    public class AdminRepository : IAdminRepository
    {
        private readonly ApplicationDbContext _context;

        public AdminRepository(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<Admin> GetByIdAsync(Guid id)
        {
            // We query the Admins DbSet to get a specific admin.
            return await _context.Admins.FindAsync(id);
        }

        public async Task<IEnumerable<Admin>> GetAllAsync()
        {
            return await _context.Admins.ToListAsync();
        }
        public async Task<Admin> AddAsync(Admin admin)
        {
            await _context.Admins.AddAsync(admin);
            return admin;
        }

        public Task<Admin> UpdateAsync(Admin admin)
        {
            _context.Entry(admin).State = EntityState.Modified;
            return Task.FromResult(admin);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var admin = await _context.Admins.FindAsync(id);
            if (admin == null)
            {
                return false;
            }
            _context.Admins.Remove(admin);
            return true;
        }
    }
}
