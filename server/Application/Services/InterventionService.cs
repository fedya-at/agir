using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces.Repositories;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;

namespace Application.Services
{
    public class InterventionService : IInterventionService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHistoryService _historyService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public InterventionService(
            IUnitOfWork unitOfWork,
            IHistoryService historyService,
            IHttpContextAccessor httpContextAccessor)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _historyService = historyService ?? throw new ArgumentNullException(nameof(historyService));
            _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User?
                .FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (Guid.TryParse(userIdClaim, out var userId))
            {
                return userId;
            }
            return Guid.Empty; // Default if no user
        }

        public async Task<IEnumerable<InterventionDto>> GetAllInterventionsAsync()
        {
            var interventions = await _unitOfWork.Interventions.GetAllAsync();
            return await MapToDtoListAsync(interventions);
        }

        public async Task<InterventionDto> GetInterventionByIdAsync(Guid id)
        {
            var intervention = await _unitOfWork.Interventions.GetByIdAsync(id);
            if (intervention == null)
                return null;

            return await MapToDtoAsync(intervention);
        }

        public async Task<IEnumerable<InterventionDto>> GetInterventionsByClientIdAsync(Guid clientId)
        {
            var interventions = await _unitOfWork.Interventions.GetByClientIdAsync(clientId);
            return await MapToDtoListAsync(interventions);
        }

        public async Task<IEnumerable<InterventionDto>> GetInterventionsByTechnicianIdAsync(Guid technicianId)
        {
            var interventions = await _unitOfWork.Interventions.GetByTechnicianIdAsync(technicianId);
            return await MapToDtoListAsync(interventions);
        }

        public async Task<IEnumerable<InterventionDto>> GetInterventionsByStatusAsync(InterventionStatus status)
        {
            var interventions = await _unitOfWork.Interventions.GetByStatusAsync(status);
            return await MapToDtoListAsync(interventions);
        }

        public async Task<IEnumerable<InterventionDto>> GetInterventionsByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            var interventions = await _unitOfWork.Interventions.GetByDateRangeAsync(startDate, endDate);
            return await MapToDtoListAsync(interventions);
        }

        public async Task<InterventionDto> CreateInterventionAsync(CreateInterventionDto interventionDto)
        {
            if (interventionDto == null)
                throw new ArgumentNullException(nameof(interventionDto));

            var client = await _unitOfWork.Clients.GetByIdAsync(interventionDto.ClientId) ??
                await _unitOfWork.Clients.GetByIdAsync(interventionDto.ClientId) ??
                throw new InvalidOperationException($"Client not found with ID {interventionDto.ClientId}");

            if (interventionDto.TechnicianId.HasValue && !await _unitOfWork.Technicians.ExistsAsync(interventionDto.TechnicianId.Value))
                throw new InvalidOperationException($"Technician with ID {interventionDto.TechnicianId} not found.");

            var intervention = new Intervention(
                interventionDto.Description,
                interventionDto.StartDate,
                client.Id,
                interventionDto.TechnicianId
            );

            await _unitOfWork.Interventions.AddAsync(intervention);
            await _unitOfWork.SaveChangesAsync();

            await _historyService.AddHistoryAsync(
                new History(
                    "Created",
                    nameof(Intervention),
                    intervention.Id,
                    GetCurrentUserId(),
                    JsonSerializer.Serialize(new
                    {
                        interventionDto.Description,
                        interventionDto.StartDate,
                        ClientId = client.Id,
                        interventionDto.TechnicianId
                    })
                )
            );

           

            return await MapToDtoAsync(intervention);
        }

        public async Task<InterventionDto> UpdateInterventionAsync(Guid id, UpdateInterventionDto interventionDto)
        {
            if (interventionDto == null)
                throw new ArgumentNullException(nameof(interventionDto));

            var intervention = await _unitOfWork.Interventions.GetByIdAsync(id) ??
                throw new InvalidOperationException($"Intervention with ID {id} not found.");

            var oldValues = new
            {
                intervention.Description,
                intervention.TechnicianId,
                intervention.Status,
                intervention.EndDate
            };

            bool technicianChanged = interventionDto.TechnicianId.HasValue &&
                                   intervention.TechnicianId != interventionDto.TechnicianId;

            intervention.UpdateDescription(interventionDto.Description);

            if (interventionDto.TechnicianId.HasValue)
                intervention.AssignTechnician(interventionDto.TechnicianId.Value);

            await _unitOfWork.Interventions.UpdateAsync(intervention);
            await _unitOfWork.SaveChangesAsync();

            await _historyService.AddHistoryAsync(
                new History(
                    "Updated",
                    nameof(Intervention),
                    intervention.Id,
                    GetCurrentUserId(),
                    JsonSerializer.Serialize(new
                    {
                        OldValues = oldValues,
                        NewValues = new
                        {
                            interventionDto.Description,
                            interventionDto.TechnicianId
                        }
                    })
                )
            );

          

            return await MapToDtoAsync(intervention);
        }

        public async Task DeleteInterventionAsync(Guid id)
        {
            var intervention = await _unitOfWork.Interventions.GetByIdAsync(id) ??
                throw new InvalidOperationException($"Intervention with ID {id} not found.");

            var deletedData = new
            {
                intervention.Description,
                intervention.StartDate,
                intervention.EndDate,
                intervention.Status,
                ClientName = (await _unitOfWork.Clients.GetByIdAsync(intervention.ClientId))?.Name,
                TechnicianName = intervention.TechnicianId.HasValue ?
                    (await _unitOfWork.Technicians.GetByIdAsync(intervention.TechnicianId.Value))?.Name : null
            };

            await _unitOfWork.Interventions.DeleteAsync(id);
            await _unitOfWork.SaveChangesAsync();

            await _historyService.AddHistoryAsync(
                new History(
                    "Deleted",
                    nameof(Intervention),
                    id,
                    GetCurrentUserId(),
                    JsonSerializer.Serialize(deletedData)
                )
            );
        }

        public async Task<InterventionDto> AssignTechnicianAsync(Guid interventionId, Guid technicianId)
        {
            var intervention = await _unitOfWork.Interventions.GetByIdAsync(interventionId) ??
                throw new InvalidOperationException($"Intervention with ID {interventionId} not found.");

            var technician = await _unitOfWork.Technicians.GetByIdAsync(technicianId) ??
                throw new InvalidOperationException($"Technician with ID {technicianId} not found.");

            var oldTechnicianId = intervention.TechnicianId;

            intervention.AssignTechnician(technicianId);
            await _unitOfWork.Interventions.UpdateAsync(intervention);
            await _unitOfWork.SaveChangesAsync();

            await _historyService.AddHistoryAsync(
                new History(
                    "TechnicianAssigned",
                    nameof(Intervention),
                    interventionId,
                    GetCurrentUserId(),
                    JsonSerializer.Serialize(new
                    {
                        OldTechnicianId = oldTechnicianId,
                        NewTechnicianId = technicianId
                    })
                )
            );

           
            return await MapToDtoAsync(intervention);
        }

        public async Task<InterventionDto> UpdateInterventionStatusAsync(Guid id, InterventionStatus newStatus)
        {
            var intervention = await _unitOfWork.Interventions.GetByIdAsync(id) ??
                throw new InvalidOperationException($"Intervention with ID {id} not found.");

            var oldStatus = intervention.Status;
            var oldEndDate = intervention.EndDate;

            switch (newStatus)
            {
                case InterventionStatus.InProgress:
                    intervention.StartIntervention();
                    break;
                case InterventionStatus.Completed:
                    intervention.CompleteIntervention(DateTime.UtcNow);
                    break;
                case InterventionStatus.Cancelled:
                    intervention.CancelIntervention();
                    break;
                default:
                    throw new InvalidOperationException($"Invalid status change requested: {newStatus}");
            }

            await _unitOfWork.Interventions.UpdateAsync(intervention);
            await _unitOfWork.SaveChangesAsync();

            await _historyService.AddHistoryAsync(
                new History(
                    "StatusChanged",
                    nameof(Intervention),
                    id,
                    GetCurrentUserId(),
                    JsonSerializer.Serialize(new
                    {
                        OldStatus = oldStatus,
                        NewStatus = newStatus,
                        OldEndDate = oldEndDate,
                        NewEndDate = intervention.EndDate
                    })
                )
            );

            return await MapToDtoAsync(intervention);
        }

        public async Task<InterventionDto> AddPartToInterventionAsync(Guid interventionId, AddInterventionPartDto partDto)
        {
            if (partDto == null)
                throw new ArgumentNullException(nameof(partDto));

            var intervention = await _unitOfWork.Interventions.GetByIdAsync(interventionId) ??
                throw new InvalidOperationException($"Intervention with ID {interventionId} not found.");

            var part = await _unitOfWork.Parts.GetByIdAsync(partDto.PartId) ??
                throw new InvalidOperationException($"Part with ID {partDto.PartId} not found.");

            if (part.StockQuantity < partDto.Quantity)
                throw new InvalidOperationException($"Not enough stock for part {part.Name}");

            intervention.AddPart(partDto.PartId, partDto.Quantity, partDto.UnitPrice);
            part.RemoveStock(partDto.Quantity);

            await _unitOfWork.Interventions.UpdateAsync(intervention);
            await _unitOfWork.Parts.UpdateAsync(part);
            await _unitOfWork.SaveChangesAsync();

            await _historyService.AddHistoryAsync(
                new History(
                    "PartAdded",
                    nameof(Intervention),
                    interventionId,
                    GetCurrentUserId(),
                    JsonSerializer.Serialize(new
                    {
                        PartId = partDto.PartId,
                        partDto.Quantity,
                        partDto.UnitPrice,
                        PartName = part.Name
                    })
                )
            );

            return await MapToDtoAsync(intervention);
        }

        public async Task<InterventionDto> RemovePartFromInterventionAsync(Guid interventionId, Guid partId)
        {
            var intervention = await _unitOfWork.Interventions.GetByIdAsync(interventionId) ??
                throw new InvalidOperationException($"Intervention with ID {interventionId} not found.");

            var part = await _unitOfWork.Parts.GetByIdAsync(partId) ??
                throw new InvalidOperationException($"Part with ID {partId} not found.");

            var interventionPart = intervention.InterventionParts.FirstOrDefault(ip => ip.PartId == partId) ??
                throw new InvalidOperationException($"Part with ID {partId} not found in intervention {interventionId}.");

            var partData = new
            {
                interventionPart.PartId,
                interventionPart.Quantity,
                interventionPart.UnitPrice,
                PartName = part.Name
            };

            part.AddStock(interventionPart.Quantity);
            intervention.RemovePart(partId);

            await _unitOfWork.Interventions.UpdateAsync(intervention);
            await _unitOfWork.Parts.UpdateAsync(part);
            await _unitOfWork.SaveChangesAsync();

            await _historyService.AddHistoryAsync(
                new History(
                    "PartRemoved",
                    nameof(Intervention),
                    interventionId,
                    GetCurrentUserId(),
                    JsonSerializer.Serialize(partData)
                )
            );

            return await MapToDtoAsync(intervention);
        }

        public async Task<InterventionDto> UpdateInterventionPartQuantityAsync(Guid interventionId, Guid partId, int quantity)
        {
            if (quantity <= 0)
                throw new ArgumentException("Quantity must be greater than zero", nameof(quantity));

            var intervention = await _unitOfWork.Interventions.GetByIdAsync(interventionId) ??
                throw new InvalidOperationException($"Intervention with ID {interventionId} not found.");

            var part = await _unitOfWork.Parts.GetByIdAsync(partId) ??
                throw new InvalidOperationException($"Part with ID {partId} not found.");

            var interventionPart = intervention.InterventionParts.FirstOrDefault(ip => ip.PartId == partId) ??
                throw new InvalidOperationException($"Part with ID {partId} not found in intervention {interventionId}.");

            int quantityDifference = quantity - interventionPart.Quantity;

            if (quantityDifference > 0 && part.StockQuantity < quantityDifference)
                throw new InvalidOperationException($"Not enough stock for part {part.Name}");

            if (quantityDifference > 0)
                part.RemoveStock(quantityDifference);
            else if (quantityDifference < 0)
                part.AddStock(Math.Abs(quantityDifference));

            intervention.UpdatePartQuantity(partId, quantity);

            await _unitOfWork.Interventions.UpdateAsync(intervention);
            await _unitOfWork.Parts.UpdateAsync(part);
            await _unitOfWork.SaveChangesAsync();

            return await MapToDtoAsync(intervention);
        }

        private async Task<InterventionDto> MapToDtoAsync(Intervention intervention)
        {
            var client = await _unitOfWork.Clients.GetByIdAsync(intervention.ClientId);
            var technician = intervention.TechnicianId.HasValue ?
                await _unitOfWork.Technicians.GetByIdAsync(intervention.TechnicianId.Value) : null;

            var dto = new InterventionDto
            {
                Id = intervention.Id,
                Description = intervention.Description,
                StartDate = intervention.StartDate,
                EndDate = intervention.EndDate,
                Status = intervention.Status,
                ClientId = intervention.ClientId,
                TechnicianId = intervention.TechnicianId,
                CreatedAt = intervention.CreatedAt,
                UpdatedAt = intervention.UpdatedAt,
                Client = client != null ? new ClientDto
                {
                    Id = client.Id,
                    Name = client.Name,
                    Email = client.Email,
                    Phone = client.Phone,
                    Address = client.Address,
                    CreatedAt = client.CreatedAt,
                    UpdatedAt = client.UpdatedAt
                } : null,
                Technician = technician != null ? new TechnicianDto
                {
                    Id = technician.Id,
                    Name = technician.Name,
                    Email = technician.Email,
                    Phone = technician.Phone,
                    Specialization = technician.Specialization,
                    HireDate = technician.HireDate,
                    IsActive = technician.IsActive,
                    CreatedAt = technician.CreatedAt,
                    UpdatedAt = technician.UpdatedAt
                } : null,
                InterventionParts = new List<InterventionPartDto>()
            };

            foreach (var interventionPart in intervention.InterventionParts)
            {
                var part = await _unitOfWork.Parts.GetByIdAsync(interventionPart.PartId);

                dto.InterventionParts.Add(new InterventionPartDto
                {
                    Id = interventionPart.Id,
                    InterventionId = interventionPart.InterventionId,
                    PartId = interventionPart.PartId,
                    Quantity = interventionPart.Quantity,
                    UnitPrice = interventionPart.UnitPrice,
                    TotalPrice = interventionPart.GetTotalPrice(),
                    CreatedAt = interventionPart.CreatedAt,
                    UpdatedAt = interventionPart.UpdatedAt,
                    Part = part != null ? new PartDto
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
                    } : null
                });
            }

            return dto;
        }

        private async Task<IEnumerable<InterventionDto>> MapToDtoListAsync(IEnumerable<Intervention> interventions)
        {
            var dtos = new List<InterventionDto>();
            foreach (var intervention in interventions)
            {
                dtos.Add(await MapToDtoAsync(intervention));
            }
            return dtos;
        }
    }
}