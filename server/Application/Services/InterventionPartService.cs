using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Exceptions;
using Domain.Interfaces.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Services
{
    public class InterventionPartService : IInterventionPartService
    {
        private readonly IUnitOfWork _unitOfWork;

        public InterventionPartService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        }

        public async Task<InterventionPartDto> GetByIdAsync(Guid id)
        {
            var interventionPart = await _unitOfWork.InterventionParts.GetByIdAsync(id);
            if (interventionPart == null)
                throw new NotFoundException("Intervention part not found");

            return MapToDto(interventionPart);
        }

        public async Task<IEnumerable<InterventionPartDto>> GetByInterventionIdAsync(Guid interventionId)
        {
            var interventionParts = await _unitOfWork.InterventionParts.GetByInterventionIdAsync(interventionId);

            if (interventionParts == null || !interventionParts.Any())
            {
                return Enumerable.Empty<InterventionPartDto>();
            }

            if (interventionParts.Any(ip => ip.Part == null))
            {
                throw new Exception("Some intervention parts are missing their Part navigation property");
            }

            return interventionParts.Select(MapToDto);
        }

        public async Task<InterventionPartDto> AddPartToInterventionAsync(Guid interventionId, CreateInterventionPartDto dto)
        {
            var intervention = await _unitOfWork.Interventions.GetByIdAsync(interventionId);
            if (intervention == null)
                throw new NotFoundException("Intervention not found");

            var part = await _unitOfWork.Parts.GetByIdAsync(dto.PartId);
            if (part == null)
                throw new NotFoundException("Part not found");

            if (await _unitOfWork.InterventionParts.ExistsAsync(interventionId, dto.PartId))
                throw new BusinessException("This part is already added to the intervention");

            try
            {
                part.RemoveStock(dto.Quantity);

                var interventionPart = new InterventionPart(
                    interventionId,
                    dto.PartId,
                    dto.Quantity,
                    part.Price
                );

                await _unitOfWork.InterventionParts.AddAsync(interventionPart);
                await _unitOfWork.Parts.UpdateAsync(part);
                await _unitOfWork.SaveChangesAsync();

                var createdPart = await _unitOfWork.InterventionParts.GetByIdWithDetailsAsync(interventionPart.Id);
                return MapToDto(createdPart);
            }
            catch (InvalidOperationException ex)
            {
                throw new BusinessException($"Stock error: {ex.Message}");
            }
        }

        public async Task UpdateInterventionPartAsync(Guid id, UpdateInterventionPartDto dto)
        {
            var interventionPart = await _unitOfWork.InterventionParts.GetByIdAsync(id);
            if (interventionPart == null)
                throw new NotFoundException("Intervention part not found");

            var part = await _unitOfWork.Parts.GetByIdAsync(interventionPart.PartId);
            if (part == null)
                throw new NotFoundException("Part not found");

            var quantityDifference = dto.Quantity - interventionPart.Quantity;

            try
            {
                if (quantityDifference > 0)
                    part.RemoveStock(quantityDifference);
                else if (quantityDifference < 0)
                    part.AddStock(Math.Abs(quantityDifference));

                interventionPart.UpdateQuantity(dto.Quantity);

                await _unitOfWork.InterventionParts.UpdateAsync(interventionPart);
                await _unitOfWork.Parts.UpdateAsync(part);
                await _unitOfWork.SaveChangesAsync();
            }
            catch (InvalidOperationException ex)
            {
                throw new BusinessException($"Stock error: {ex.Message}");
            }
        }

        public async Task RemovePartFromInterventionAsync(Guid id)
        {
            var interventionPart = await _unitOfWork.InterventionParts.GetByIdAsync(id);
            if (interventionPart == null)
                throw new NotFoundException("Intervention part not found");

            var part = await _unitOfWork.Parts.GetByIdAsync(interventionPart.PartId);
            if (part == null)
                throw new NotFoundException("Part not found");

            try
            {
                part.AddStock(interventionPart.Quantity);
                await _unitOfWork.InterventionParts.DeleteAsync(interventionPart);
                await _unitOfWork.Parts.UpdateAsync(part);
                await _unitOfWork.SaveChangesAsync();
            }
            catch (InvalidOperationException ex)
            {
                throw new BusinessException($"Stock error: {ex.Message}");
            }
        }

        private InterventionPartDto MapToDto(InterventionPart ip)
        {
            return new InterventionPartDto
            {
                Id = ip.Id,
                InterventionId = ip.InterventionId,
                PartId = ip.PartId,
                Quantity = ip.Quantity,
                UnitPrice = ip.UnitPrice,
                TotalPrice = ip.GetTotalPrice(),
                PartName = ip.Part?.Name,
                PartDescription = ip.Part?.Description,
                Part = ip.Part != null
                    ? new PartDto
                    {
                        Id = ip.Part.Id,
                        Name = ip.Part.Name,
                        Description = ip.Part.Description,
                        Price = ip.Part.Price,
                        StockQuantity = ip.Part.StockQuantity,
                        MinStockLevel = ip.Part.MinStockLevel,
                        IsLowStock = ip.Part.IsCriticalStock
                    }
                    : null
            };
        }
    }

    public class NotFoundException : Exception
    {
        public NotFoundException(string message) : base(message) { }
    }

    public class BusinessException : Exception
    {
        public BusinessException(string message) : base(message) { }
    }
}
