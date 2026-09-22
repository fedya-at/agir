using Application.DTOs;
using Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IUserService
    {
        Task<IEnumerable<UserDto>> GetAllUsersAsync();
        Task<UserDto> GetUserByIdAsync(Guid id);
        Task<UserDto> GetUserByUsernameAsync(string username);
        Task<UserDto> GetUserByEmailAsync(string email);
        Task<IEnumerable<UserDto>> GetUsersByRoleAsync(UserRole role);
        Task<UserDto> UpdateUserAsync(Guid id, UpdateUserDto userDto);
        Task DeleteUserAsync(Guid id);
        Task<UserDto> ActivateUserAsync(Guid id);
        Task<UserDto> DeactivateUserAsync(Guid id);
        Task<UserDto> ChangePasswordAsync(Guid id, ChangePasswordDto passwordDto);
        Task<UserDto> ChangeRoleAsync(Guid id, UserRole newRole);
        Task<AuthResponseDto> AuthenticateAsync(AuthRequestDto authRequest);
        Task AdminResetPasswordAsync(Guid id, AdminResetPasswordDto passwordDto);

    }
}
