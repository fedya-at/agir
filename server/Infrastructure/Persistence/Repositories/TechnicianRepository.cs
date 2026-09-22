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
    public class TechnicianRepository : ITechnicianRepository
    {
        private readonly ApplicationDbContext _context;

        public TechnicianRepository(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<IEnumerable<Technician>> GetAllAsync()
        {
            return await _context.Technicians.ToListAsync();
        }

        public async Task<Technician> GetByIdAsync(Guid id)
        {
            return await _context.Technicians.FindAsync(id);
        }

        public async Task<Technician> GetByEmailAsync(string email)
        {
            return await _context.Technicians.FirstOrDefaultAsync(t => t.Email == email);
        }

      
        public async Task<IEnumerable<Technician>> GetActiveAsync()
        {
            return await _context.Technicians.Where(t => t.IsActive).ToListAsync();
        }

        public async Task<IEnumerable<Technician>> SearchAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                return await GetAllAsync();

            return await _context.Technicians
                .Where(t => t.Name.Contains(searchTerm) ||
                            t.Email.Contains(searchTerm) ||
                            t.Phone.Contains(searchTerm) ||
                            t.Specialization.Contains(searchTerm))
                .ToListAsync();
        }

        public async Task<bool> ExistsAsync(Guid id)
        {
            return await _context.Technicians.AnyAsync(t => t.Id == id);
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            return await _context.Technicians.AnyAsync(t => t.Email == email);
        }

        public async Task AddAsync(Technician technician)
        {
            await _context.Technicians.AddAsync(technician);
        }

        public Task UpdateAsync(Technician technician)
        {
            _context.Entry(technician).State = EntityState.Modified;
            return Task.CompletedTask;
        }

        public Task DeleteAsync(Guid id)
        {
            var technician = _context.Technicians.Find(id);
            if (technician != null)
            {
                _context.Technicians.Remove(technician);
            }
            return Task.CompletedTask;
        }
    }
}
