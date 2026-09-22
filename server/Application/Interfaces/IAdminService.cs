using Application.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IAdminService
    {
        Task<IEnumerable<UserDto>> GetAllAdminsAsync();
        Task<UserDto> GetAdminByIdAsync(Guid id);

        // CORRECT: Use CreateUserDto for adding a new admin
        Task<UserDto> AddAdminAsync(CreateUserDto adminDto);

        // CORRECT: Use UpdateUserDto for updating an admin
        Task<UserDto> UpdateAdminAsync(Guid id, UpdateUserDto adminDto);

        Task<bool> DeleteAdminAsync(Guid id);
    }
}
