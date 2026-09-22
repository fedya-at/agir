using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class UserService : IUserService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IJwtTokenGenerator _jwtTokenGenerator;

        public UserService(
            IUnitOfWork unitOfWork,
            IPasswordHasher passwordHasher,
            IJwtTokenGenerator jwtTokenGenerator)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _passwordHasher = passwordHasher ?? throw new ArgumentNullException(nameof(passwordHasher));
            _jwtTokenGenerator = jwtTokenGenerator ?? throw new ArgumentNullException(nameof(jwtTokenGenerator));
        }

        public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
        {
            var users = await _unitOfWork.Users.GetAllAsync();
            var userDtos = new List<UserDto>();

            foreach (var user in users)
            {
                userDtos.Add(MapToDto(user));
            }

            return userDtos;
        }

        public async Task<UserDto> GetUserByIdAsync(Guid id)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(id);
            if (user == null)
                return null;

            return MapToDto(user);
        }

        public async Task<UserDto> GetUserByUsernameAsync(string username)
        {
            var user = await _unitOfWork.Users.GetByUsernameAsync(username);
            if (user == null)
                return null;

            return MapToDto(user);
        }

        public async Task<UserDto> GetUserByEmailAsync(string email)
        {
            var user = await _unitOfWork.Users.GetByEmailAsync(email);
            if (user == null)
                return null;

            return MapToDto(user);
        }

        public async Task<IEnumerable<UserDto>> GetUsersByRoleAsync(UserRole role)
        {
            var users = await _unitOfWork.Users.GetByRoleAsync(role);
            var userDtos = new List<UserDto>();

            foreach (var user in users)
            {
                userDtos.Add(MapToDto(user));
            }

            return userDtos;
        }

      
        public async Task<UserDto> UpdateUserAsync(Guid id, UpdateUserDto userDto)
        {
            if (userDto == null)
                throw new ArgumentNullException(nameof(userDto));

            var user = await _unitOfWork.Users.GetByIdAsync(id);
            if (user == null)
                throw new InvalidOperationException($"User with ID {id} not found.");

            // Check if email is being changed and if it already exists
            if (user.Email != userDto.Email && await _unitOfWork.Users.EmailExistsAsync(userDto.Email))
                throw new InvalidOperationException($"A user with email {userDto.Email} already exists.");

            user.UpdateEmail(userDto.Email);

            await _unitOfWork.Users.UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(user);
        }

        public async Task DeleteUserAsync(Guid id)
        {
            if (!await _unitOfWork.Users.ExistsAsync(id))
                throw new InvalidOperationException($"User with ID {id} not found.");

            await _unitOfWork.Users.DeleteAsync(id);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<UserDto> ActivateUserAsync(Guid id)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(id);
            if (user == null)
                throw new InvalidOperationException($"User with ID {id} not found.");

            user.Activate();
            await _unitOfWork.Users.UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(user);
        }

        public async Task<UserDto> DeactivateUserAsync(Guid id)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(id);
            if (user == null)
                throw new InvalidOperationException($"User with ID {id} not found.");

            user.Deactivate();
            await _unitOfWork.Users.UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(user);
        }

        public async Task<UserDto> ChangePasswordAsync(Guid id, ChangePasswordDto passwordDto)
        {
            if (passwordDto == null)
                throw new ArgumentNullException(nameof(passwordDto));

            if (passwordDto.NewPassword != passwordDto.ConfirmNewPassword)
                throw new InvalidOperationException("New password and confirmation do not match.");

            var user = await _unitOfWork.Users.GetByIdAsync(id);
            if (user == null)
                throw new InvalidOperationException($"User with ID {id} not found.");

            if (!_passwordHasher.VerifyPassword(user.PasswordHash, passwordDto.CurrentPassword))
                throw new InvalidOperationException("Current password is incorrect.");

            var newPasswordHash = _passwordHasher.HashPassword(passwordDto.NewPassword);
            user.UpdatePassword(newPasswordHash);

            await _unitOfWork.Users.UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(user);
        }

        // In Application/Services/UserService.cs

        public async Task<UserDto> ChangeRoleAsync(Guid id, UserRole newRole)
        {
            // 1. Find the original user
            var originalUser = await _unitOfWork.Users.GetByIdAsync(id);
            if (originalUser == null)
            {
                throw new InvalidOperationException($"User with ID {id} not found.");
            }

            // If the role is not actually changing, do nothing.
            if (originalUser.Role == newRole)
            {
                return MapToDto(originalUser);
            }

            // 2. Delete the old entity (this will cascade to the Users table)
            // We need to check the original type to know which repository to use for deletion.
            if (originalUser is Client)
            {
                await _unitOfWork.Clients.DeleteAsync(id);
            }
            else if (originalUser is Technician)
            {
                await _unitOfWork.Technicians.DeleteAsync(id);
            }
            else if (originalUser is Admin)
            {
                await _unitOfWork.Admins.DeleteAsync(id);
            }

            // We need to save changes here to complete the deletion before adding the new user
            // with the same ID.
            await _unitOfWork.SaveChangesAsync();


            // 3. Create the new user entity of the correct type
            User newUser;
            if (newRole == UserRole.Technician)
            {
                newUser = new Technician(
                    originalUser.Username,
                    originalUser.Email,
                    originalUser.PasswordHash,
                    originalUser.Name,
                    originalUser.Phone,
                    "Default Specialization", // Provide a default value
                    DateTime.UtcNow          // Provide a default hire date
                );
            }
            else // For both Client and Admin roles, we create a Client entity
            {
                // Try to preserve the address if the original was a client/admin
                string address = (originalUser as Client)?.Address ?? "Default Address";

                newUser = new Client(
                    originalUser.Username,
                    originalUser.Email,
                    originalUser.PasswordHash,
                    originalUser.Name,
                    originalUser.Phone,
                    address
                );
            }

            // Manually set the ID to be the same as the old user
            // This requires a public setter on the Id property in BaseEntity
            // In Domain/Entities/BaseEntity.cs, change:
            // public Guid Id { get; protected set; } -> public Guid Id { get; set; }
            newUser.Id = id;

            // If the new role is Admin, we must explicitly set it after creation
            if (newRole == UserRole.Admin)
            {
                newUser.UpdateRole(UserRole.Admin);
            }


            // 4. Add the new user to the database
            await _unitOfWork.Users.AddAsync(newUser);
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(newUser);
        }


        public async Task<AuthResponseDto> AuthenticateAsync(AuthRequestDto authRequest)
        {
            if (authRequest == null)
                throw new ArgumentNullException(nameof(authRequest));

            if (string.IsNullOrWhiteSpace(authRequest.LoginIdentifier))
                throw new ArgumentException("Email/Username is required.");

            if (string.IsNullOrWhiteSpace(authRequest.Password))
                throw new ArgumentException("Password is required.");

            // Determine if the input is an email or username
            var isEmail = authRequest.LoginIdentifier.Contains("@");

            User user = isEmail
                ? await _unitOfWork.Users.GetByEmailAsync(authRequest.LoginIdentifier)
                : await _unitOfWork.Users.GetByUsernameAsync(authRequest.LoginIdentifier);

            if (user == null)
                throw new InvalidOperationException("User not found. Please check your email/username.");

            if (!user.IsActive)
                throw new InvalidOperationException("User account is deactivated. Please contact support.");

            if (!_passwordHasher.VerifyPassword(user.PasswordHash, authRequest.Password))
                throw new InvalidOperationException("Incorrect password. Please try again.");

            var token = _jwtTokenGenerator.GenerateToken(user);
            var expiration = DateTime.UtcNow.AddHours(1);

            return new AuthResponseDto
            {
                Token = token,
                Expiration = expiration,
                User = MapToDto(user)
            };
        }
        public async Task AdminResetPasswordAsync(Guid id, AdminResetPasswordDto passwordDto)
        {
            if (passwordDto == null || string.IsNullOrWhiteSpace(passwordDto.NewPassword))
                throw new ArgumentException("New password cannot be empty.", nameof(passwordDto));

            var user = await _unitOfWork.Users.GetByIdAsync(id);
            if (user == null)
                throw new InvalidOperationException($"User with ID {id} not found.");

            // Hash the new password provided by the admin
            var newPasswordHash = _passwordHasher.HashPassword(passwordDto.NewPassword);

            // Update the user's password hash in the database
            user.UpdatePassword(newPasswordHash);

            await _unitOfWork.Users.UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();
        }
        private UserDto MapToDto(User user)
        {
            var userDto = new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,
                IsActive = user.IsActive,
                Name = user.Name,
                Phone = user.Phone,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt

            };
            if (user is Client client)
            {
                // Clients have an Address
                userDto.Address = client.Address;
            }
           if (user is Technician technician)
            {
                // Technicians have Specialization and HireDate
                userDto.Specialization = technician.Specialization;
                userDto.HireDate = technician.HireDate;
            }
            
            return userDto;
        }
    }
}
