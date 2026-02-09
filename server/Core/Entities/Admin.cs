using Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Admin : User
    {
        protected Admin() : base() { }

        public Admin(string username, string email, string passwordHash, string name, string phone)
            : base(username, email, passwordHash, UserRole.Admin, name, phone)
        {
            // No extra properties to set here.
        }
    }
}
