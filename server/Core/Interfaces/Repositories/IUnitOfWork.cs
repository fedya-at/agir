using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces.Repositories
{
    public interface IUnitOfWork : IDisposable
    {
        IClientRepository Clients { get; }
        ITechnicianRepository Technicians { get; }
        IInterventionRepository Interventions { get; }
        IPartRepository Parts { get; }
        IInvoiceRepository Invoices { get; }
        IInvoicePaymentRepository InvoicePayments { get; }
        IUserRepository Users { get; }
        IInterventionPartRepository InterventionParts { get; }
        IAdminRepository Admins { get; }
        IHistoryRepository Histories { get; }
        IAlertRepository Alerts { get; }


        Task<int> SaveChangesAsync();
        Task BeginTransactionAsync();
        Task CommitTransactionAsync();
        Task RollbackTransactionAsync();
    }
}
