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
    public class TechnicianService : ITechnicianService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IPasswordHasher _passwordHasher; 

        public TechnicianService(IUnitOfWork unitOfWork, IPasswordHasher passwordHasher)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _passwordHasher = passwordHasher ?? throw new ArgumentNullException(nameof(passwordHasher));
        }

        public async Task<IEnumerable<TechnicianDto>> GetAllTechniciansAsync()
        {
            var technicians = await _unitOfWork.Technicians.GetAllAsync();
            var technicianDtos = new List<TechnicianDto>();

            foreach (var technician in technicians)
            {
                technicianDtos.Add(MapToDto(technician));
            }

            return technicianDtos;
        }

        public async Task<TechnicianDto> GetTechnicianByIdAsync(Guid id)
        {
            var technician = await _unitOfWork.Technicians.GetByIdAsync(id);
            if (technician == null)
                return null;

            return MapToDto(technician);
        }
      

        public async Task<TechnicianDto> GetTechnicianByEmailAsync(string email)
        {
            var technician = await _unitOfWork.Technicians.GetByEmailAsync(email);
            if (technician == null)
                return null;

            return MapToDto(technician);
        }

        public async Task<IEnumerable<TechnicianDto>> GetActiveTechniciansAsync()
        {
            var technicians = await _unitOfWork.Technicians.GetActiveAsync();
            var technicianDtos = new List<TechnicianDto>();

            foreach (var technician in technicians)
            {
                technicianDtos.Add(MapToDto(technician));
            }

            return technicianDtos;
        }

        public async Task<IEnumerable<TechnicianDto>> SearchTechniciansAsync(string searchTerm)
        {
            var technicians = await _unitOfWork.Technicians.SearchAsync(searchTerm);
            var technicianDtos = new List<TechnicianDto>();

            foreach (var technician in technicians)
            {
                technicianDtos.Add(MapToDto(technician));
            }

            return technicianDtos;
        }

        public async Task<TechnicianDto> CreateTechnicianAsync(CreateTechnicianDto technicianDto)
        {
            if (technicianDto == null)
                throw new ArgumentNullException(nameof(technicianDto));

            // Check against the main Users table for uniqueness
            if (await _unitOfWork.Users.UsernameExistsAsync(technicianDto.Username))
                throw new InvalidOperationException($"A user with username '{technicianDto.Username}' already exists.");

            if (await _unitOfWork.Users.EmailExistsAsync(technicianDto.Email))
                throw new InvalidOperationException($"A user with email '{technicianDto.Email}' already exists.");

            var passwordHash = _passwordHasher.HashPassword(technicianDto.Password);

            var technician = new Technician(
                  technicianDto.Username,
                  technicianDto.Email,
                  passwordHash,
                  technicianDto.Name,
                  technicianDto.Phone,
                  technicianDto.Specialization,
                  technicianDto.HireDate
              );

            await _unitOfWork.Technicians.AddAsync(technician);
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(technician);
        }

        public async Task<TechnicianDto> UpdateTechnicianAsync(Guid id, UpdateTechnicianDto technicianDto)
        {
            if (technicianDto == null)
                throw new ArgumentNullException(nameof(technicianDto));

            var technician = await _unitOfWork.Technicians.GetByIdAsync(id);
            if (technician == null)
                throw new InvalidOperationException($"Technician with ID {id} not found.");

            if (technician.Email != technicianDto.Email && await _unitOfWork.Users.EmailExistsAsync(technicianDto.Email))
                throw new InvalidOperationException($"A user with email '{technicianDto.Email}' already exists.");

            technician.Update(
                technicianDto.Name,
                technicianDto.Email,
                technicianDto.Phone,
                technicianDto.Specialization
            );

            await _unitOfWork.Users.UpdateAsync(technician);
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(technician);
        }

        public async Task DeleteTechnicianAsync(Guid id)
        {
            if (!await _unitOfWork.Technicians.ExistsAsync(id))
                throw new InvalidOperationException($"Technician with ID {id} not found.");

            await _unitOfWork.Technicians.DeleteAsync(id);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<TechnicianDto> ActivateTechnicianAsync(Guid id)
        {
            var technician = await _unitOfWork.Technicians.GetByIdAsync(id);
            if (technician == null)
                throw new InvalidOperationException($"Technician with ID {id} not found.");

            technician.Activate();
            await _unitOfWork.Technicians.UpdateAsync(technician);
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(technician);
        }

        public async Task<TechnicianDto> DeactivateTechnicianAsync(Guid id)
        {
            var technician = await _unitOfWork.Technicians.GetByIdAsync(id);
            if (technician == null)
                throw new InvalidOperationException($"Technician with ID {id} not found.");

            technician.Deactivate();
            await _unitOfWork.Technicians.UpdateAsync(technician);
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(technician);
        }

        public async Task<IEnumerable<InterventionDto>> GetTechnicianInterventionsAsync(Guid technicianId)
        {
            if (!await _unitOfWork.Technicians.ExistsAsync(technicianId))
                throw new InvalidOperationException($"Technician with ID {technicianId} not found.");

            var interventions = await _unitOfWork.Interventions.GetByTechnicianIdAsync(technicianId);
            var interventionDtos = new List<InterventionDto>();

            foreach (var intervention in interventions)
            {
                interventionDtos.Add(MapToInterventionDto(intervention));
            }

            return interventionDtos;
        }

        private TechnicianDto MapToDto(Technician technician)
        {
            return new TechnicianDto
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
            };
        }

        private InterventionDto MapToInterventionDto(Intervention intervention)
        {
            return new InterventionDto
            {
                Id = intervention.Id,
                Description = intervention.Description,
                StartDate = intervention.StartDate,
                EndDate = intervention.EndDate,
                Status = intervention.Status,
                ClientId = intervention.ClientId,
                TechnicianId = intervention.TechnicianId,
                CreatedAt = intervention.CreatedAt,
                UpdatedAt = intervention.UpdatedAt
            };
        }
    }
}
