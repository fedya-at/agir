using Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IPartService
    {
        Task<IEnumerable<PartDto>> GetAllPartsAsync();
        Task<PartDto> GetPartByIdAsync(Guid id);
        Task<IEnumerable<PartDto>> GetPartsByIdsAsync(IEnumerable<Guid> ids);
        Task<IEnumerable<PartDto>> SearchPartsAsync(string searchTerm);
        Task<IEnumerable<PartDto>> GetLowStockPartsAsync();
        Task<PartDto> CreatePartAsync(CreatePartDto partDto);
        Task<PartDto> UpdatePartAsync(Guid id, UpdatePartDto partDto);
        Task DeletePartAsync(Guid id);
        Task<PartDto> AddStockAsync(Guid id, int quantity);
        Task<PartDto> RemoveStockAsync(Guid id, int quantity);
    }
}
