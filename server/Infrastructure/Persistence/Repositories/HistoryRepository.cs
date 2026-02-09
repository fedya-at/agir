using Domain.Entities;
using Domain.Interfaces.Repositories;
using Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Infrastructure.Persistence.Repositories
{
    public class HistoryRepository : IHistoryRepository
    {
        private readonly ApplicationDbContext _context;

        public HistoryRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public IQueryable<History> GetAll() =>  _context.Histories.AsQueryable();

        public async Task AddAsync(History history)
        {
            await _context.Histories.AddAsync(history);
        }

        public async Task<IEnumerable<History>> GetByEntityIdAsync(Guid entityId)
        {
            return await _context.Histories
                .Where(h => h.EntityId == entityId)
                .OrderByDescending(h => h.Timestamp)
                .ToListAsync();
        }

        public async Task<IEnumerable<History>> GetByEntityAsync(string entityName, Guid entityId)
        {
            return await _context.Histories
                .Where(h => h.EntityName == entityName && h.EntityId == entityId)
                .OrderByDescending(h => h.Timestamp)
                .ToListAsync();
        }

        public async Task<IEnumerable<History>> GetByUserAsync(Guid userId)
        {
            return await _context.Histories
                .Where(h => h.UserId == userId)
                .OrderByDescending(h => h.Timestamp)
                .ToListAsync();
        }

        public async Task<IEnumerable<History>> GetByEntityNameAsync(string entityName)
        {
            return await _context.Histories
                .Where(h => h.EntityName == entityName)
                .OrderByDescending(h => h.Timestamp)
                .ToListAsync();
        }

        public async Task ClearAsync()
        {
            _context.Histories.RemoveRange(_context.Histories);
            await _context.SaveChangesAsync();
        }

        // Legacy method (consider removing if not needed)
        public async Task<IEnumerable<History>> GetHistory(string entityName = null, string action = null, Guid? userId = null)
        {
            var query = _context.Histories.AsQueryable();

            if (!string.IsNullOrEmpty(entityName))
            {
                query = query.Where(h => h.EntityName == entityName);
            }

            if (!string.IsNullOrEmpty(action))
            {
                query = query.Where(h => h.Action == action);
            }

            if (userId.HasValue)
            {
                query = query.Where(h => h.UserId == userId.Value);
            }

            return await query
                .OrderByDescending(h => h.Timestamp)
                .ToListAsync();
        }


    }
}