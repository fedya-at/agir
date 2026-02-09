using Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IClientService
    {
        Task<IEnumerable<ClientDto>> GetAllClientsAsync();
        Task<ClientDto> GetClientByIdAsync(Guid id);
        Task<ClientDto> GetClientByEmailAsync(string email);
        Task<IEnumerable<ClientDto>> SearchClientsAsync(string searchTerm);
        Task<ClientDto> CreateClientAsync(CreateClientDto clientDto);
        Task<ClientDto> UpdateClientAsync(Guid id, UpdateClientDto clientDto);
        Task DeleteClientAsync(Guid id);
        Task<IEnumerable<InterventionDto>> GetClientInterventionsAsync(Guid clientId);
    }
}
