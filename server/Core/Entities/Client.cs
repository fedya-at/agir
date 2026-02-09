using Domain.Enums;
using Domain.Exceptions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Client : User
    {
        public string Address { get; private set; }
        private readonly HashSet<Intervention> _interventions = new();
        public IReadOnlyCollection<Intervention> Interventions => _interventions;

        protected Client() : base() { }

        // Constructor for regular clients (uses UserRole.Client by default)
        public Client(string username, string email, string passwordHash, string name, string phone, string address)
            : base(username, email, passwordHash, UserRole.Client, name, phone)
        {
            Address = address;
        }

        
        public void Update(string name, string email, string phone, string address)
        {
            Name = name ?? throw new ArgumentNullException(nameof(name));
            Email = email ?? throw new ArgumentNullException(nameof(email));
            Phone = phone;
            Address = address;
            UpdateModifiedDate();
        }

        internal void AddIntervention(Intervention i)
        {
            if (_interventions.Count >= 50)
                throw new Exception();
            _interventions.Add(i);
        }
    }
}
