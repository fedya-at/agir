using Domain.Interfaces.Repositories;
using Infrastructure.Persistence.Context;
using Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore.Storage;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;
        private IDbContextTransaction _transaction;

        private IClientRepository _clientRepository;
        private ITechnicianRepository _technicianRepository;
        private IInterventionRepository _interventionRepository;
        private IPartRepository _partRepository;
        private IInvoiceRepository _invoiceRepository;
        private IInvoicePaymentRepository _invoicePaymentRepository;
        private IUserRepository _userRepository;
        private IInterventionPartRepository _interventionPartRepository;
        private IHistoryRepository _historyRepository;
        private IAlertRepository _alertRepository; 
        private IAdminRepository _adminRepository; 


        public UnitOfWork(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public IClientRepository Clients => _clientRepository ??= new ClientRepository(_context);
        public ITechnicianRepository Technicians => _technicianRepository ??= new TechnicianRepository(_context);
        public IInterventionRepository Interventions => _interventionRepository ??= new InterventionRepository(_context);
        public IPartRepository Parts => _partRepository ??= new PartRepository(_context);
        public IInvoiceRepository Invoices => _invoiceRepository ??= new InvoiceRepository(_context);
        public IInvoicePaymentRepository InvoicePayments => _invoicePaymentRepository ??= new InvoicePaymentRepository(_context);
        public IUserRepository Users => _userRepository ??= new UserRepository(_context);
        public IInterventionPartRepository InterventionParts => _interventionPartRepository ??= new InterventionPartRepository(_context);
        public IHistoryRepository Histories => _historyRepository ??= new HistoryRepository(_context);
        public IAlertRepository Alerts => _alertRepository ??= new AlertRepository(_context);
       public IAdminRepository Admins => _adminRepository ??= new AdminRepository(_context);

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public async Task BeginTransactionAsync()
        {
            _transaction = await _context.Database.BeginTransactionAsync();
        }

        public async Task CommitTransactionAsync()
        {
            try
            {
                if (_transaction != null)
                {
                    await _transaction.CommitAsync();
                }
            }
            finally
            {
                if (_transaction != null)
                {
                    await _transaction.DisposeAsync();
                    _transaction = null;
                }
            }
        }

        public async Task RollbackTransactionAsync()
        {
            try
            {
                if (_transaction != null)
                {
                    await _transaction.RollbackAsync();
                }
            }
            finally
            {
                if (_transaction != null)
                {
                    await _transaction.DisposeAsync();
                    _transaction = null;
                }
            }
        }

        public void Dispose()
        {
            _transaction?.Dispose();
            _context.Dispose();
        }
    }
}
