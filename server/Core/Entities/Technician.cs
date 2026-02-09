using Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Technician : User
    {
        public string Specialization { get; private set; }
        public DateTime HireDate { get; private set; }

        // Navigation properties
        private readonly List<Intervention> _interventions = new List<Intervention>();
        public IReadOnlyCollection<Intervention> Interventions => _interventions.AsReadOnly();

        protected Technician() : base() { }

        public Technician(string username, string email, string passwordHash, string name, string phone, string specialization, DateTime hireDate)
            : base(username, email, passwordHash, UserRole.Technician, name, phone)
        {
            Specialization = specialization;
            HireDate = hireDate;
        }

        public void Update(string name, string email, string phone, string specialization)
        {
            Name = name ?? throw new ArgumentNullException(nameof(name));
            Email = email ?? throw new ArgumentNullException(nameof(email));
            Phone = phone;
            Specialization = specialization;
            UpdateModifiedDate();
        }

        // Method to add an intervention (for internal use by domain services)
        internal void AddIntervention(Intervention intervention)
        {
            _interventions.Add(intervention);
        }
    }
}
