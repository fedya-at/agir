using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Interfaces.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class PartService : IPartService
    {
        private readonly IUnitOfWork _unitOfWork;

        public PartService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        }

        public async Task<IEnumerable<PartDto>> GetAllPartsAsync()
        {
            var parts = await _unitOfWork.Parts.GetAllAsync();
            var partDtos = new List<PartDto>();

            foreach (var part in parts)
            {
                partDtos.Add(MapToDto(part));
            }

            return partDtos;
        }

        public async Task<PartDto> GetPartByIdAsync(Guid id)
        {
            var part = await _unitOfWork.Parts.GetByIdAsync(id);
            if (part == null)
                return null;

            return MapToDto(part);
        }

        public async Task<IEnumerable<PartDto>> GetPartsByIdsAsync(IEnumerable<Guid> ids)
        {
            var parts = await _unitOfWork.Parts.GetByIdsAsync(ids);
            var partDtos = new List<PartDto>();

            foreach (var part in parts)
            {
                partDtos.Add(MapToDto(part));
            }

            return partDtos;
        }

        public async Task<IEnumerable<PartDto>> SearchPartsAsync(string searchTerm)
        {
            var parts = await _unitOfWork.Parts.SearchAsync(searchTerm);
            var partDtos = new List<PartDto>();

            foreach (var part in parts)
            {
                partDtos.Add(MapToDto(part));
            }

            return partDtos;
        }

        public async Task<IEnumerable<PartDto>> GetLowStockPartsAsync()
        {
            var parts = await _unitOfWork.Parts.GetLowStockAsync();
            var partDtos = new List<PartDto>();

            foreach (var part in parts)
            {
                partDtos.Add(MapToDto(part));
            }

            return partDtos;
        }

        public async Task<PartDto> CreatePartAsync(CreatePartDto partDto)
        {
            if (partDto == null)
                throw new ArgumentNullException(nameof(partDto));

            var part = new Part(
                partDto.Name,
                partDto.Description,
                partDto.Price,
                partDto.StockQuantity,
                partDto.MinStockLevel
            );

            await _unitOfWork.Parts.AddAsync(part);
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(part);
        }

        public async Task<PartDto> UpdatePartAsync(Guid id, UpdatePartDto partDto)
        {
            if (partDto == null)
                throw new ArgumentNullException(nameof(partDto));

            var part = await _unitOfWork.Parts.GetByIdAsync(id);
            if (part == null)
                throw new InvalidOperationException($"Part with ID {id} not found.");

            part.Update(
                partDto.Name,
                partDto.Description,
                partDto.Price,
                partDto.MinStockLevel
            );

            await _unitOfWork.Parts.UpdateAsync(part);
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(part);
        }

        public async Task DeletePartAsync(Guid id)
        {
            if (!await _unitOfWork.Parts.ExistsAsync(id))
                throw new InvalidOperationException($"Part with ID {id} not found.");

            await _unitOfWork.Parts.DeleteAsync(id);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<PartDto> AddStockAsync(Guid id, int quantity)
        {
            if (quantity <= 0)
                throw new ArgumentException("Quantity must be greater than zero", nameof(quantity));

            var part = await _unitOfWork.Parts.GetByIdAsync(id);
            if (part == null)
                throw new InvalidOperationException($"Part with ID {id} not found.");

            part.AddStock(quantity);
            await _unitOfWork.Parts.UpdateAsync(part);
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(part);
        }

        public async Task<PartDto> RemoveStockAsync(Guid id, int quantity)
        {
            if (quantity <= 0)
                throw new ArgumentException("Quantity must be greater than zero", nameof(quantity));

            var part = await _unitOfWork.Parts.GetByIdAsync(id);
            if (part == null)
                throw new InvalidOperationException($"Part with ID {id} not found.");

            part.RemoveStock(quantity);
            await _unitOfWork.Parts.UpdateAsync(part);
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(part);
        }


        private PartDto MapToDto(Part part)
        {
            return new PartDto
            {
                Id = part.Id,
                Name = part.Name,
                Description = part.Description,
                Price = part.Price,
                StockQuantity = part.StockQuantity,
                MinStockLevel = part.MinStockLevel,
                IsLowStock = part.IsLowStock(),
                CreatedAt = part.CreatedAt,
                UpdatedAt = part.UpdatedAt
            };
        }
    }
}
