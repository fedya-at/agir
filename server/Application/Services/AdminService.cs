using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Interfaces.Repositories;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Services
{
    public class AdminService : IAdminService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IPasswordHasher _passwordHasher;

        public AdminService(IUnitOfWork unitOfWork, IPasswordHasher passwordHasher)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _passwordHasher = passwordHasher ?? throw new ArgumentNullException(nameof(passwordHasher));
        }

        public async Task<IEnumerable<UserDto>> GetAllAdminsAsync()
        {
            var admins = await _unitOfWork.Admins.GetAllAsync();
            return admins.Select(MapToUserDto);
        }

        public async Task<UserDto> GetAdminByIdAsync(Guid id)
        {
            var admin = await _unitOfWork.Admins.GetByIdAsync(id);
            if (admin == null) return null;
            return MapToUserDto(admin);
        }

        // CORRECT: The method signature now matches the interface
        public async Task<UserDto> AddAdminAsync(CreateUserDto adminCreateDto)
        {
            if (await _unitOfWork.Users.UsernameExistsAsync(adminCreateDto.Username))
            {
                throw new InvalidOperationException($"Username '{adminCreateDto.Username}' already exists.");
            }
            if (await _unitOfWork.Users.EmailExistsAsync(adminCreateDto.Email))
            {
                throw new InvalidOperationException($"Email '{adminCreateDto.Email}' already exists.");
            }

            var admin = new Admin(
                adminCreateDto.Username,
                adminCreateDto.Email,
                _passwordHasher.HashPassword(adminCreateDto.Password),
                adminCreateDto.Name,
                adminCreateDto.Phone
            );

            
            await _unitOfWork.Admins.AddAsync(admin);
            await _unitOfWork.SaveChangesAsync();

            return MapToUserDto(admin);
        }

        // CORRECT: The method signature now matches the interface
        public async Task<UserDto> UpdateAdminAsync(Guid id, UpdateUserDto adminUpdateDto)
        {
            var admin = await _unitOfWork.Admins.GetByIdAsync(id);
            if (admin == null)
            {
                throw new InvalidOperationException("Admin not found.");
            }

            // You will need to expand UpdateUserDto to include all updatable fields
            // or create a specific UpdateAdminDto. For now, we just update the email.
            if (admin.Email != adminUpdateDto.Email && await _unitOfWork.Users.EmailExistsAsync(adminUpdateDto.Email))
            {
                throw new InvalidOperationException($"Email '{adminUpdateDto.Email}' already exists.");
            }
            admin.UpdateEmail(adminUpdateDto.Email);
            // Example: admin.UpdateName(adminUpdateDto.Name); etc.

            await _unitOfWork.Admins.UpdateAsync(admin);
            await _unitOfWork.SaveChangesAsync();

            return MapToUserDto(admin);
        }

        public async Task<bool> DeleteAdminAsync(Guid id)
        {
            var success = await _unitOfWork.Admins.DeleteAsync(id);
            if (success)
            {
                await _unitOfWork.SaveChangesAsync();
            }
            return success;
        }

        private UserDto MapToUserDto(Admin admin)
        {
            return new UserDto
            {
                Id = admin.Id,
                Username = admin.Username,
                Email = admin.Email,
                Role = admin.Role,
                IsActive = admin.IsActive,
                Name = admin.Name,
                Phone = admin.Phone,
                CreatedAt = admin.CreatedAt,
                UpdatedAt = admin.UpdatedAt
            };
        }
    }
}
