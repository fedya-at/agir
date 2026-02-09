using Application.DTOs;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IHistoryService
    {
        Task<PagedResult<HistoryDto>> GetAllHistoryAsync(int pageNumber = 1, int pageSize = 100, CancellationToken cancellationToken = default);
        Task<PagedResult<HistoryDto>> GetHistoryAsync(HistoryFilterSortDto filterSortDto = null, CancellationToken cancellationToken = default);
        Task AddHistoryAsync(History history, CancellationToken cancellationToken = default);
        Task<IEnumerable<HistoryDto>> GetByEntityIdAsync(Guid entityId, CancellationToken cancellationToken = default);
        Task<IEnumerable<HistoryDto>> GetByEntityAsync(string entityName, Guid entityId, CancellationToken cancellationToken = default);
        Task<IEnumerable<HistoryDto>> GetByUserAsync(Guid userId, CancellationToken cancellationToken = default);
        Task<IEnumerable<HistoryDto>> GetByEntityNameAsync(string entityName, CancellationToken cancellationToken = default);
        Task<byte[]> ExportHistoryToPdfAsync();
        Task<byte[]> ExportHistoryToExcelAsync();
        Task<byte[]> ExportHistoryToCsvAsync();

    }
}
