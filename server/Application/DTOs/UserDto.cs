using Domain.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class UserDto : BaseDto
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public UserRole Role { get; set; }
        public bool IsActive { get; set; }
        public string Name { get; set; }
        public string Phone { get; set; }

        // Role-specific properties (can be nullable)
        public string? Address { get; set; }      // For Client/Admin
        public string? Specialization { get; set; } // For Technician
        public DateTime? HireDate { get; set; }
    }

    /// <summary>
    /// DTO for creating a new User
    /// </summary>
    public class CreateUserDto
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }

        [Range(0, 2, ErrorMessage = "Invalid role value")]
        public UserRole? Role { get; set; }

        //Optional properties for Client or Technician
        public string Name { get; set; }
        public string Phone { get; set; }
        public string Address { get; set; } // For Client
        public string? Specialization { get; set; } // For Technician
        public DateTime? HireDate { get; set; } // For Technician
    }

    /// <summary>
    /// DTO for updating an existing User
    /// </summary>
    public class UpdateUserDto
    {
        public string Email { get; set; }
    }

    /// <summary>
    /// DTO for changing user password
    /// </summary>
    public class ChangePasswordDto
    {
        public string CurrentPassword { get; set; }
        public string NewPassword { get; set; }
        public string ConfirmNewPassword { get; set; }
    }

    /// <summary>
    /// DTO for authentication request
    /// </summary>
   public class AuthRequestDto
{
    public string LoginIdentifier { get; set; }  // Can be either email or username
    
    public string Password { get; set; }
}

    /// <summary>
    /// DTO for authentication response
    /// </summary>
    public class AuthResponseDto
    {
        public string Token { get; set; }
        public DateTime Expiration { get; set; }
        public UserDto User { get; set; }
    }
}
