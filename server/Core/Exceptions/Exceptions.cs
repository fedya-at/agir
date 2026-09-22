using Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Exceptions
{
    // Domain/Exceptions/DomainException.cs (base exception)
    public abstract class DomainException : Exception
    {
        protected DomainException(string message) : base(message) { }
        protected DomainException(string message, Exception innerException) : base(message, innerException) { }
    }

    // Domain/Exceptions/ClientExceptions.cs
    public class ClientNotFoundException : DomainException
    {
        public Guid ClientId { get; }

        public ClientNotFoundException(Guid clientId)
            : base($"Client with ID {clientId} was not found")
        {
            ClientId = clientId;
        }
    }

    public class ClientEmailAlreadyExistsException : DomainException
    {
        public string Email { get; }

        public ClientEmailAlreadyExistsException(string email)
            : base($"Client with email {email} already exists")
        {
            Email = email;
        }
    }

    // Domain/Exceptions/InterventionExceptions.cs
    public class InterventionNotFoundException : DomainException
    {
        public Guid InterventionId { get; }

        public InterventionNotFoundException(Guid interventionId)
            : base($"Intervention with ID {interventionId} was not found")
        {
            InterventionId = interventionId;
        }
    }

    public class InvalidInterventionStatusChangeException : DomainException
    {
        public InterventionStatus CurrentStatus { get; }
        public InterventionStatus AttemptedStatus { get; }

        public InvalidInterventionStatusChangeException(InterventionStatus currentStatus, InterventionStatus attemptedStatus)
            : base($"Cannot change intervention status from {currentStatus} to {attemptedStatus}")
        {
            CurrentStatus = currentStatus;
            AttemptedStatus = attemptedStatus;
        }
    }

    // Domain/Exceptions/PartExceptions.cs
    public class PartNotFoundException : DomainException
    {
        public Guid PartId { get; }

        public PartNotFoundException(Guid partId)
            : base($"Part with ID {partId} was not found")
        {
            PartId = partId;
        }
    }

    public class InsufficientStockException : DomainException
    {
        public string PartName { get; }
        public int RequestedQuantity { get; }
        public int AvailableQuantity { get; }

        public InsufficientStockException(string partName, int requestedQuantity, int availableQuantity)
            : base($"Not enough stock for part {partName}. Requested: {requestedQuantity}, Available: {availableQuantity}")
        {
            PartName = partName;
            RequestedQuantity = requestedQuantity;
            AvailableQuantity = availableQuantity;
        }
    }

    // Domain/Exceptions/InvoiceExceptions.cs
    public class InvoiceNotFoundException : DomainException
    {
        public Guid InvoiceId { get; }

        public InvoiceNotFoundException(Guid invoiceId)
            : base($"Invoice with ID {invoiceId} was not found")
        {
            InvoiceId = invoiceId;
        }
    }

    public class InvalidInvoiceStatusChangeException : DomainException
    {
        public InvoiceStatus CurrentStatus { get; }
        public InvoiceStatus AttemptedStatus { get; }

        public InvalidInvoiceStatusChangeException(InvoiceStatus currentStatus, InvoiceStatus attemptedStatus)
            : base($"Cannot change invoice status from {currentStatus} to {attemptedStatus}")
        {
            CurrentStatus = currentStatus;
            AttemptedStatus = attemptedStatus;
        }
    }

    // Domain/Exceptions/TechnicianExceptions.cs
    public class TechnicianNotFoundException : DomainException
    {
        public Guid TechnicianId { get; }

        public TechnicianNotFoundException(Guid technicianId)
            : base($"Technician with ID {technicianId} was not found")
        {
            TechnicianId = technicianId;
        }
    }

    public class TechnicianEmailAlreadyExistsException : DomainException
    {
        public string Email { get; }

        public TechnicianEmailAlreadyExistsException(string email)
            : base($"Technician with email {email} already exists")
        {
            Email = email;
        }
    }

    // Domain/Exceptions/UserExceptions.cs
    public class UserNotFoundException : DomainException
    {
        public Guid UserId { get; }

        public UserNotFoundException(Guid userId)
            : base($"User with ID {userId} was not found")
        {
            UserId = userId;
        }
    }

    public class InvalidCredentialsException : DomainException
    {
        public InvalidCredentialsException()
            : base("Invalid username or password") { }
    }

    public class UserEmailAlreadyExistsException : DomainException
    {
        public string Email { get; }

        public UserEmailAlreadyExistsException(string email)
            : base($"User with email {email} already exists")
        {
            Email = email;
        }
    }
}
