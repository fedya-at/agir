using Application.DTOs;
using Application.Interfaces;
using CsvHelper;
using Domain.Entities;
using Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Formats.Asn1;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Services
{
    public class HistoryService : IHistoryService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IPdfExportService _pdfExportService;
        private readonly IExcelExportService _excelExportService;
        private readonly ICsvExportService _csvExportService;
        public HistoryService(
        IUnitOfWork unitOfWork,
        IPdfExportService pdfExportService,
        IExcelExportService excelExportService,
         ICsvExportService csvExportService  )
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _pdfExportService = pdfExportService ?? throw new ArgumentNullException(nameof(pdfExportService));
            _excelExportService = excelExportService ?? throw new ArgumentNullException(nameof(excelExportService));
            _csvExportService = csvExportService ?? throw new ArgumentNullException(nameof(csvExportService));

        }

        public async Task<PagedResult<HistoryDto>> GetAllHistoryAsync(int pageNumber = 1, int pageSize = 100, CancellationToken cancellationToken = default)
        {
            var query = _unitOfWork.Histories.GetAll()
                .OrderByDescending(h => h.Timestamp);

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            var itemsDto = items.Select(MapToDto);

            return new PagedResult<HistoryDto>
            {
                Items = itemsDto,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<PagedResult<HistoryDto>> GetHistoryAsync(HistoryFilterSortDto filterSortDto = null, CancellationToken cancellationToken = default)
{
    var query = _unitOfWork.Histories.GetAll();

    // Only apply filters if filterSortDto is provided
    if (filterSortDto != null)
    {
        if (filterSortDto.StartDate.HasValue)
        {
            query = query.Where(h => h.Timestamp >= filterSortDto.StartDate.Value);
        }

        if (filterSortDto.EndDate.HasValue)
        {
            query = query.Where(h => h.Timestamp <= filterSortDto.EndDate.Value);
        }

        if (!string.IsNullOrEmpty(filterSortDto.Action))
        {
            query = query.Where(h => h.Action == filterSortDto.Action);
        }

        if (!string.IsNullOrEmpty(filterSortDto.EntityName))
        {
            query = query.Where(h => h.EntityName == filterSortDto.EntityName);
        }

        if (filterSortDto.UserId != Guid.Empty)
        {
            query = query.Where(h => h.UserId == filterSortDto.UserId);
        }
    }

    // Apply sorting (use default if no sort specified)
    if (filterSortDto?.SortBy != null)
    {
        query = filterSortDto.SortBy.ToLower() switch
        {
            "timestamp" => filterSortDto.IsAscending 
                ? query.OrderBy(h => h.Timestamp) 
                : query.OrderByDescending(h => h.Timestamp),
            "action" => filterSortDto.IsAscending 
                ? query.OrderBy(h => h.Action) 
                : query.OrderByDescending(h => h.Action),
            "entityname" => filterSortDto.IsAscending 
                ? query.OrderBy(h => h.EntityName) 
                : query.OrderByDescending(h => h.EntityName),
            _ => query.OrderByDescending(h => h.Timestamp)
        };
    }
    else
    {
        query = query.OrderByDescending(h => h.Timestamp);
    }

    // Get total count
    var totalCount = await query.CountAsync(cancellationToken);

    // Apply pagination (use defaults if not specified)
    var pageNumber = filterSortDto?.PageNumber ?? 1;
    var pageSize = filterSortDto?.PageSize ?? totalCount; // Return all if not specified

    var items = await query
        .Skip((pageNumber - 1) * pageSize)
        .Take(pageSize)
        .ToListAsync(cancellationToken);

            // Map to DTO
            var itemsDto = items.Select(MapToDto);

            return new PagedResult<HistoryDto>
    {
        Items = itemsDto,
        TotalCount = totalCount,
        PageNumber = pageNumber,
        PageSize = pageSize
    };
}

        public async Task AddHistoryAsync(History history, CancellationToken cancellationToken = default)
        {
            if (history == null)
                throw new ArgumentNullException(nameof(history));

            await _unitOfWork.Histories.AddAsync(history);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<IEnumerable<HistoryDto>> GetByEntityIdAsync(Guid entityId, CancellationToken cancellationToken = default)
        {
            var histories = await _unitOfWork.Histories.GetByEntityIdAsync(entityId);
            return histories.Select(MapToDto);
        }

        public async Task<IEnumerable<HistoryDto>> GetByEntityAsync(string entityName, Guid entityId, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrEmpty(entityName))
                throw new ArgumentNullException(nameof(entityName));

            var histories = await _unitOfWork.Histories.GetByEntityAsync(entityName, entityId);
            return histories.Select(MapToDto);
        }

        public async Task<IEnumerable<HistoryDto>> GetByUserAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            var histories = await _unitOfWork.Histories.GetByUserAsync(userId);
            return histories.Select(MapToDto);
        }

        public async Task<IEnumerable<HistoryDto>> GetByEntityNameAsync(string entityName, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrEmpty(entityName))
                throw new ArgumentNullException(nameof(entityName));

            var histories = await _unitOfWork.Histories.GetByEntityNameAsync(entityName);
            return histories.Select(MapToDto);
        }
        public async Task<byte[]> ExportHistoryToPdfAsync()
        {
            var histories = await GetAllHistoryAsync();
            return await _pdfExportService.ExportToPdf(histories.Items, "History Report");
        }

        public async Task<byte[]> ExportHistoryToExcelAsync()
        {
            var histories = await GetAllHistoryAsync();
            if (histories?.Items == null || !histories.Items.Any())
            {
                return Array.Empty<byte>();
            }
            return _excelExportService.ExportToExcel<HistoryDto>(histories.Items, "History");
        }

        public async Task<byte[]> ExportHistoryToCsvAsync()
        {
            var histories = await GetAllHistoryAsync();
            if (histories?.Items == null || !histories.Items.Any())
            {
                return Array.Empty<byte>();
            }
            return await _csvExportService.ExportToCsv(histories.Items);
        }


        private HistoryDto MapToDto(History history)
        {
            return new HistoryDto
            {
                Id = history.Id,
                EntityId = history.EntityId,
                EntityName = history.EntityName,
                Action = history.Action,
                UserId = history.UserId,
                Timestamp = history.Timestamp,
                Changes = history.Changes
            };
        }
    }
}
