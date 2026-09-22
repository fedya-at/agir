using Domain.Enums;
using Domain.Exceptions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
   public class Intervention : BaseEntity
    {
        public string Description { get; private set; }
        public DateTime StartDate { get; private set; }
        public DateTime? EndDate { get; private set; }
        public InterventionStatus Status { get; private set; }
        public decimal LaborCost { get; private set; }

        public Guid ClientId { get; private set; }
        public Guid? TechnicianId { get; private set; }
        // Navigation properties
        public Client Client { get; private set; }
        public Technician Technician { get; private set; }
        public Invoice Invoice { get; private set; }

        private readonly HashSet<InterventionPart> _interventionParts = new();
        public IReadOnlyCollection<InterventionPart> InterventionParts => _interventionParts;
        public decimal TotalCost => LaborCost + _interventionParts.Sum(x => x.GetTotalPrice());

        // For EF Core
        protected Intervention() : base() { }

        public Intervention(string description, DateTime startDate, Guid clientId, Guid? technicianId = null) : base()
        {
            Description = description ?? throw new ArgumentNullException(nameof(description));
            StartDate = startDate;
            ClientId = clientId;
            TechnicianId = technicianId;
            Status = InterventionStatus.Pending;
        }

        public void UpdateDescription(string description)
        {
            Description = description ?? throw new ArgumentNullException(nameof(description));
            UpdateModifiedDate();
        }

        public void AssignTechnician(Guid technicianId)
        {
            TechnicianId = technicianId;
            UpdateModifiedDate();
        }

        public void StartIntervention()
        {
            Status = InterventionStatus.InProgress;
            UpdateModifiedDate();
        }

        public void CompleteIntervention(DateTime endDate)
        {
            if (Status != InterventionStatus.InProgress)
                throw new InvalidInterventionStatusChangeException(Status, InterventionStatus.Completed);

            Status = InterventionStatus.Completed;
            EndDate = endDate;
            UpdateModifiedDate();


        }

        public void CancelIntervention()
        {
            if (Status == InterventionStatus.Completed)
            {
                throw new InvalidOperationException("Cannot cancel a completed intervention.");
            }

            Status = InterventionStatus.Cancelled;
            UpdateModifiedDate();
        }

        public InterventionPart AddPart(Guid partId, int quantity, decimal unitPrice)
        {
            var interventionPart = new InterventionPart(Id, partId, quantity, unitPrice);
            _interventionParts.Add(interventionPart);
            UpdateModifiedDate();
            return interventionPart;
        }

        public void RemovePart(Guid partId)
        {
            var part = _interventionParts.FirstOrDefault(p => p.PartId == partId);
            if (part != null)
            {
                _interventionParts.Remove(part);
                UpdateModifiedDate();
            }
        }

        public void UpdatePartQuantity(Guid partId, int newQuantity)
        {
            var part = _interventionParts.FirstOrDefault(p => p.PartId == partId);
            if (part != null)
            {
                part.UpdateQuantity(newQuantity);
                UpdateModifiedDate();
            }
        }
        public void SetLaborCost(decimal amount)
        {
            if (amount < 0)
                throw new Exception("Labor cost cannot be negative");
            if (Invoice.Status != InvoiceStatus.Draft)
                throw new Exception("Can only modify costs in Draft status");

            LaborCost = amount;
            UpdateModifiedDate();
        }
    }
}


