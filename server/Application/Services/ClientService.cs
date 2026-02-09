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
    public class ClientService : IClientService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IPasswordHasher _passwordHasher;


        public ClientService(IUnitOfWork unitOfWork, IPasswordHasher passwordHasher)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _passwordHasher = passwordHasher ?? throw new ArgumentNullException(nameof(passwordHasher));

        }

        public async Task<IEnumerable<ClientDto>> GetAllClientsAsync()
        {
            var clients = await _unitOfWork.Clients.GetAllAsync();
            var clientDtos = new List<ClientDto>();

            foreach (var client in clients)
            {
                clientDtos.Add(MapToDto(client));
            }

            return clientDtos;
        }

        public async Task<ClientDto> GetClientByIdAsync(Guid id)
        {
            var client = await _unitOfWork.Clients.GetByIdAsync(id);
            if (client == null)
                return null;

            return MapToDto(client);
        }

        public async Task<ClientDto> GetClientByEmailAsync(string email)
        {
            var client = await _unitOfWork.Clients.GetByEmailAsync(email);
            if (client == null)
                return null;

            return MapToDto(client);
        }
      

        public async Task<IEnumerable<ClientDto>> SearchClientsAsync(string searchTerm)
        {
            var clients = await _unitOfWork.Clients.SearchAsync(searchTerm);
            var clientDtos = new List<ClientDto>();

            foreach (var client in clients)
            {
                clientDtos.Add(MapToDto(client));
            }

            return clientDtos;
        }

        public async Task<ClientDto> CreateClientAsync(CreateClientDto clientDto)
        {
            if (clientDto == null)
                throw new ArgumentNullException(nameof(clientDto));

            // Check against the main Users table for uniqueness
            if (await _unitOfWork.Users.UsernameExistsAsync(clientDto.Username))
                throw new InvalidOperationException($"A user with username '{clientDto.Username}' already exists.");

            if (await _unitOfWork.Users.EmailExistsAsync(clientDto.Email))
                throw new InvalidOperationException($"A user with email '{clientDto.Email}' already exists.");

            var passwordHash = _passwordHasher.HashPassword(clientDto.Password);
            var client = new Client(
                clientDto.Username,
                clientDto.Email,
                passwordHash,
                clientDto.Name,
                clientDto.Phone,
                clientDto.Address
            );

            // Add the new client to the Users repository
            await _unitOfWork.Users.AddAsync(client);
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(client);
        }

        public async Task<ClientDto> UpdateClientAsync(Guid id, UpdateClientDto clientDto)
        {
            if (clientDto == null)
                throw new ArgumentNullException(nameof(clientDto));

            var client = await _unitOfWork.Clients.GetByIdAsync(id);
            if (client == null)
                throw new InvalidOperationException($"Client with ID {id} not found.");

            // Check if email is being changed and if it already exists
            if (client.Email != clientDto.Email && await _unitOfWork.Clients.EmailExistsAsync(clientDto.Email))
                throw new InvalidOperationException($"A client with email {clientDto.Email} already exists.");

            client.Update(
                clientDto.Name,
                clientDto.Email,
                clientDto.Phone,
                clientDto.Address
            );

            await _unitOfWork.Clients.UpdateAsync(client);
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(client);
        }

        public async Task DeleteClientAsync(Guid id)
        {
            if (!await _unitOfWork.Clients.ExistsAsync(id))
                throw new InvalidOperationException($"Client with ID {id} not found.");

            await _unitOfWork.Clients.DeleteAsync(id);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<IEnumerable<InterventionDto>> GetClientInterventionsAsync(Guid clientId)
        {
            if (!await _unitOfWork.Clients.ExistsAsync(clientId))
                throw new InvalidOperationException($"Client with ID {clientId} not found.");

            var interventions = await _unitOfWork.Interventions.GetByClientIdAsync(clientId);
            var interventionDtos = new List<InterventionDto>();

            foreach (var intervention in interventions)
            {
                interventionDtos.Add(MapToInterventionDto(intervention));
            }

            return interventionDtos;
        }

        private ClientDto MapToDto(Client client)
        {
            return new ClientDto
            {
                Id = client.Id,
                Username = client.Username,
                Email = client.Email,
                Name = client.Name,
                Phone = client.Phone,
                Address = client.Address,
                IsActive = client.IsActive,
                CreatedAt = client.CreatedAt,
                UpdatedAt = client.UpdatedAt
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
