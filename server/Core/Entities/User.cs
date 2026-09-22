// Domain/Entities/User.cs
using Domain.Enums;
using System;

namespace Domain.Entities
{
    public abstract class User : BaseEntity
    {
        public string Username { get; protected set; }
        public string Email { get; protected set; }
        public string PasswordHash { get; protected set; }
        public UserRole Role { get; protected  set; }
        public bool IsActive { get; protected set; }
        public string Name { get; protected set; }
        public string Phone { get; protected set; }

        protected User() : base() { }

        protected User(string username, string email, string passwordHash, UserRole role, string name, string phone) : base()
        {
            Username = !string.IsNullOrWhiteSpace(username) ? username : throw new ArgumentNullException(nameof(username));
            Email = !string.IsNullOrWhiteSpace(email) ? email : throw new ArgumentNullException(nameof(email));
            PasswordHash = passwordHash ?? throw new ArgumentNullException(nameof(passwordHash));
            Role = role;
            Name = name ?? throw new ArgumentNullException(nameof(name));
            Phone = phone;
            IsActive = true;
        }

        public void UpdateEmail(string email)
        {
            Email = email ?? throw new ArgumentNullException(nameof(email));
            UpdateModifiedDate();
        }
        public void SetRoleForSeeding(UserRole newRole)
        {
            this.Role = newRole;
        }
        public void UpdatePassword(string passwordHash)
        {
            PasswordHash = passwordHash ?? throw new ArgumentNullException(nameof(passwordHash));
            UpdateModifiedDate();
        }

        public void UpdateRole(UserRole role)
        {
            if (!Enum.IsDefined(typeof(UserRole), role))
                throw new ArgumentException($"Invalid role value: {role}", nameof(role));
            Role = role;
            UpdateModifiedDate();
        }

        public void Activate()
        {
            IsActive = true;
            UpdateModifiedDate();
        }

        public void Deactivate()
        {
            IsActive = false;
            UpdateModifiedDate();
        }
    }
}
