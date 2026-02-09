using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces.Repositories;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Application.Services
{
    public class InvoiceService : IInvoiceService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IPdfGeneratorService _pdfGenerator;
        private readonly IInvoiceNumberGenerator _invoiceNumberGenerator;
        private readonly IHistoryService _historyService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public InvoiceService(
       IUnitOfWork unitOfWork,
       IPdfGeneratorService pdfGenerator,
       IInvoiceNumberGenerator invoiceNumberGenerator,
         IHistoryService historyService,
            IHttpContextAccessor httpContextAccessor)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _pdfGenerator = pdfGenerator ?? throw new ArgumentNullException(nameof(pdfGenerator));
            _invoiceNumberGenerator = invoiceNumberGenerator ?? throw new ArgumentNullException(nameof(invoiceNumberGenerator));
            _historyService = historyService ?? throw new ArgumentNullException(nameof(historyService));
            _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
        }
        private Guid GetCurrentUserId()
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User?
                .FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (Guid.TryParse(userIdClaim, out var userId))
            {
                return userId;
            }
            return Guid.Empty; // Default if no user
        }

        public async Task<IEnumerable<InvoiceDto>> GetAllInvoicesAsync()
        {
            var invoices = await _unitOfWork.Invoices.GetAllAsync();
            return await MapToDtoListAsync(invoices);
        }

        public async Task<InvoiceDto> GetInvoiceByIdAsync(Guid id)
        {
            var invoice = await _unitOfWork.Invoices.GetByIdAsync(id);
            if (invoice == null)
                return null;

            return await MapToDtoAsync(invoice);
        }

        public async Task<InvoiceDto> GetInvoiceByInvoiceNumberAsync(string invoiceNumber)
        {
            var invoice = await _unitOfWork.Invoices.GetByInvoiceNumberAsync(invoiceNumber);
            if (invoice == null)
                return null;

            return await MapToDtoAsync(invoice);
        }

        public async Task<InvoiceDto> GetInvoiceByInterventionIdAsync(Guid interventionId)
        {
            var invoice = await _unitOfWork.Invoices.GetByInterventionIdAsync(interventionId);
            if (invoice == null)
                return null;

            return await MapToDtoAsync(invoice);
        }

        public async Task<IEnumerable<InvoiceDto>> GetInvoicesByStatusAsync(InvoiceStatus status)
        {
            var invoices = await _unitOfWork.Invoices.GetByStatusAsync(status);
            return await MapToDtoListAsync(invoices);
        }

        public async Task<IEnumerable<InvoiceDto>> GetInvoicesByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            var invoices = await _unitOfWork.Invoices.GetByDateRangeAsync(startDate, endDate);
            return await MapToDtoListAsync(invoices);
        }

        public async Task<IEnumerable<InvoiceDto>> GetOverdueInvoicesAsync()
        {
            var invoices = await _unitOfWork.Invoices.GetOverdueAsync();
            return await MapToDtoListAsync(invoices);
        }
        public async Task<InvoiceDto> CreateInvoiceAsync(CreateInvoiceDto invoiceDto)
        {
            if (invoiceDto == null)
                throw new ArgumentNullException(nameof(invoiceDto));

            // Validate intervention exists
            var intervention = await _unitOfWork.Interventions.GetByIdAsync(invoiceDto.InterventionId);
            if (intervention == null)
                throw new InvalidOperationException($"Intervention with ID {invoiceDto.InterventionId} not found.");

            // Check if invoice already exists for this intervention
            var existingInvoice = await _unitOfWork.Invoices.GetByInterventionIdAsync(invoiceDto.InterventionId);
            if (existingInvoice != null)
                throw new InvalidOperationException($"An invoice already exists for intervention with ID {invoiceDto.InterventionId}.");

            // Generate invoice number if not provided
            var invoiceNumber = string.IsNullOrEmpty(invoiceDto.InvoiceNumber)
                ? await _invoiceNumberGenerator.GenerateNextInvoiceNumberAsync()
                : invoiceDto.InvoiceNumber;

            // Check if invoice number is unique when provided manually
            if (!string.IsNullOrEmpty(invoiceDto.InvoiceNumber) &&
                await _unitOfWork.Invoices.InvoiceNumberExistsAsync(invoiceDto.InvoiceNumber))
            {
                throw new InvalidOperationException($"An invoice with number {invoiceDto.InvoiceNumber} already exists.");
            }
            Invoice.SetGlobalLaborCost(invoiceDto.LaborCost);

            var invoice = new Invoice(
                invoiceDto.InterventionId,
                invoiceNumber,
                invoiceDto.IssueDate,
                invoiceDto.DueDate,
                invoiceDto.LaborCost,
                invoiceDto.TotalPartsCost
            );

            await _unitOfWork.Invoices.AddAsync(invoice);
            await _unitOfWork.SaveChangesAsync();
            await _historyService.AddHistoryAsync(
               new History(
                   "Created",
                   nameof(Invoice),
                   invoice.Id,
                   GetCurrentUserId(),
                   JsonSerializer.Serialize(new
                   {
                       invoiceDto.InterventionId,
                       InvoiceNumber = invoiceNumber,
                       invoiceDto.IssueDate,
                       invoiceDto.DueDate,
                       invoiceDto.LaborCost,
                       invoiceDto.TotalPartsCost
                   })
               )
           );
            return await MapToDtoAsync(invoice);
        }
        public async Task<InvoiceDto> UpdateInvoiceAsync(Guid id, UpdateInvoiceDto invoiceDto)
        {
            if (invoiceDto == null)
                throw new ArgumentNullException(nameof(invoiceDto));

            var invoice = await _unitOfWork.Invoices.GetByIdAsync(id);
            if (invoice == null)
                throw new InvalidOperationException($"Invoice with ID {id} not found.");

            var oldValues = new
            {
                invoice.DueDate,
                invoice.LaborCost,
                invoice.TotalPartsCost,
                invoice.Status
            };
           
            invoice.UpdateDueDate(invoiceDto.DueDate);
            invoice.UpdateCosts(invoiceDto.LaborCost, invoiceDto.TotalPartsCost);

            await _unitOfWork.Invoices.UpdateAsync(invoice);
            await _unitOfWork.SaveChangesAsync();

            await _historyService.AddHistoryAsync(
            new History(
                "Updated",
                nameof(Invoice),
                invoice.Id,
                GetCurrentUserId(),
                JsonSerializer.Serialize(new
                {
                    OldValues = oldValues,
                    NewValues = new
                    {
                        invoiceDto.DueDate,
                        invoiceDto.LaborCost,
                        invoiceDto.TotalPartsCost
                    }
                })
            )
        );


            return await MapToDtoAsync(invoice);
        }

        public async Task DeleteInvoiceAsync(Guid id)
        {
            var invoice = await _unitOfWork.Invoices.GetByIdAsync(id);
            if (invoice == null)
                throw new InvalidOperationException($"Invoice with ID {id} not found.");

            var deletedData = new
            {
                invoice.InvoiceNumber,
                invoice.IssueDate,
                invoice.DueDate,
                invoice.Status,
                invoice.LaborCost,
                invoice.TotalPartsCost,
                invoice.TotalAmount,
                InterventionId = invoice.InterventionId
            };

            await _unitOfWork.Invoices.DeleteAsync(id);
            await _unitOfWork.SaveChangesAsync();
            await _historyService.AddHistoryAsync(
              new History(
                  "Deleted",
                  nameof(Invoice),
                  id,
                  GetCurrentUserId(),
                  JsonSerializer.Serialize(deletedData)
              )
          );
        }

        public async Task<InvoiceDto> IssueInvoiceAsync(Guid id)
        {
            var invoice = await _unitOfWork.Invoices.GetByIdAsync(id);
            if (invoice == null)
                throw new InvalidOperationException($"Invoice with ID {id} not found.");
            var oldStatus = invoice.Status;

            invoice.IssueInvoice();
            await _unitOfWork.Invoices.UpdateAsync(invoice);
            await _unitOfWork.SaveChangesAsync();
            await _historyService.AddHistoryAsync(
               new History(
                   "StatusChanged",
                   nameof(Invoice),
                   id,
                   GetCurrentUserId(),
                   JsonSerializer.Serialize(new
                   {
                       OldStatus = oldStatus,
                       NewStatus = invoice.Status
                   })
               )
           );

            return await MapToDtoAsync(invoice);
        }

        public async Task<InvoiceDto> MarkInvoiceAsPaidAsync(Guid id)
        {
            var invoice = await _unitOfWork.Invoices.GetByIdAsync(id);
            if (invoice == null)
                throw new InvalidOperationException($"Invoice with ID {id} not found.");
            var oldStatus = invoice.Status;

            invoice.MarkAsPaid();
            await _unitOfWork.Invoices.UpdateAsync(invoice);
            await _unitOfWork.SaveChangesAsync();
            await _historyService.AddHistoryAsync(
               new History(
                   "StatusChanged",
                   nameof(Invoice),
                   id,
                   GetCurrentUserId(),
                   JsonSerializer.Serialize(new
                   {
                       OldStatus = oldStatus,
                       NewStatus = invoice.Status
                   })
               )
           );
            return await MapToDtoAsync(invoice);
        }

        public async Task<InvoiceDto> CancelInvoiceAsync(Guid id)
        {
            var invoice = await _unitOfWork.Invoices.GetByIdAsync(id);
            if (invoice == null)
                throw new InvalidOperationException($"Invoice with ID {id} not found.");
            var oldStatus = invoice.Status;

            invoice.CancelInvoice();
            await _unitOfWork.Invoices.UpdateAsync(invoice);
            await _unitOfWork.SaveChangesAsync();
            await _historyService.AddHistoryAsync(
                new History(
                    "StatusChanged",
                    nameof(Invoice),
                    id,
                    GetCurrentUserId(),
                    JsonSerializer.Serialize(new
                    {
                        OldStatus = oldStatus,
                        NewStatus = invoice.Status
                    })
                )
            );

            return await MapToDtoAsync(invoice);
        }

        public async Task<InvoiceDto> AddPaymentAsync(Guid invoiceId, CreateInvoicePaymentDto paymentDto)
        {
            if (paymentDto == null)
                throw new ArgumentNullException(nameof(paymentDto));

            var invoice = await _unitOfWork.Invoices.GetByIdAsync(invoiceId);
            if (invoice == null)
                throw new InvalidOperationException($"Invoice with ID {invoiceId} not found.");
            if (invoice.Status != InvoiceStatus.Issued)
                throw new InvalidOperationException("Cannot add payment to an invoice that isn't in Issued status.");
            if (invoice.Status != InvoiceStatus.Issued)
                throw new InvalidOperationException("Payments can only be added to issued invoices.");
            if (paymentDto.Amount <= 0)
                throw new ArgumentException("Payment amount must be greater than zero", nameof(paymentDto.Amount));
            var payment = new InvoicePayment(
                invoiceId,
                paymentDto.Amount,
                paymentDto.PaymentDate,
                paymentDto.PaymentMethod,
                paymentDto.Reference
            );

            await _unitOfWork.InvoicePayments.AddAsync(payment);

            // If payment amount equals or exceeds total amount, mark invoice as paid
            var existingPayments = await _unitOfWork.InvoicePayments.GetByInvoiceIdAsync(invoiceId);
            decimal totalPaid = existingPayments.Sum(p => p.Amount) + paymentDto.Amount;
            var oldStatus = invoice.Status;

            if (totalPaid >= invoice.TotalAmount)
            {
                invoice.MarkAsPaid();
                await _unitOfWork.Invoices.UpdateAsync(invoice);
            }

            await _unitOfWork.SaveChangesAsync();
            await _historyService.AddHistoryAsync(
               new History(
                   "PaymentAdded",
                   nameof(Invoice),
                   invoiceId,
                   GetCurrentUserId(),
                   JsonSerializer.Serialize(new
                   {
                       PaymentId = payment.Id,
                       paymentDto.Amount,
                       paymentDto.PaymentDate,
                       paymentDto.PaymentMethod,
                       paymentDto.Reference,
                       TotalPaid = totalPaid,
                       InvoiceTotal = invoice.TotalAmount,
                       StatusChanged = oldStatus != invoice.Status,
                       NewStatus = invoice.Status
                   })
               )
           );
            return await MapToDtoAsync(invoice);
        }

        public async Task<IEnumerable<InvoicePaymentDto>> GetInvoicePaymentsAsync(Guid invoiceId)
        {
            if (!await _unitOfWork.Invoices.ExistsAsync(invoiceId))
                throw new InvalidOperationException($"Invoice with ID {invoiceId} not found.");

            var payments = await _unitOfWork.InvoicePayments.GetByInvoiceIdAsync(invoiceId);
            var paymentDtos = new List<InvoicePaymentDto>();

            foreach (var payment in payments)
            {
                paymentDtos.Add(MapToPaymentDto(payment));
            }

            return paymentDtos;
        }

        public async Task<byte[]> GenerateInvoicePdfAsync(Guid id)
        {
            var invoice = await _unitOfWork.Invoices.GetByIdAsync(id);
            if (invoice == null)
                throw new InvalidOperationException($"Invoice with ID {id} not found.");

            // Get intervention with all includes
            var intervention = await _unitOfWork.Interventions.GetByIdAsync(invoice.InterventionId);
            if (intervention == null)
                throw new InvalidOperationException($"Intervention with ID {invoice.InterventionId} not found.");

            return _pdfGenerator.GenerateInvoicePdf(invoice, intervention);
        }


        public async Task<InvoiceDto> GenerateInvoiceForInterventionAsync(Guid interventionId)
        {
            var intervention = await _unitOfWork.Interventions.GetByIdAsync(interventionId);
            if (intervention == null)
                throw new InvalidOperationException($"Intervention with ID {interventionId} not found.");

            if (intervention.Status != InterventionStatus.Completed)
                throw new InvalidOperationException("Cannot generate invoice for non-completed intervention");

            // Check if invoice already exists
            var existingInvoice = await _unitOfWork.Invoices.GetByInterventionIdAsync(interventionId);
            if (existingInvoice != null)
                throw new InvalidOperationException($"An invoice already exists for intervention with ID {interventionId}");

            // Generate invoice number
            var invoiceNumber = await _invoiceNumberGenerator.GenerateNextInvoiceNumberAsync();
            var issueDate = DateTime.Now;
            var dueDate = issueDate.AddDays(30); // Standard 30-day payment term
            Invoice.SetGlobalLaborCost(intervention.LaborCost);

            var invoice = new Invoice(
                interventionId,
                invoiceNumber,
                issueDate,
                dueDate,
                intervention.LaborCost,
                intervention.InterventionParts.Sum(ip => ip.GetTotalPrice())
            );

            await _unitOfWork.Invoices.AddAsync(invoice);
            await _unitOfWork.SaveChangesAsync();
            await _historyService.AddHistoryAsync(
                new History(
                    "Generated",
                    nameof(Invoice),
                    invoice.Id,
                    GetCurrentUserId(),
                    JsonSerializer.Serialize(new
                    {
                        InterventionId = interventionId,
                        InvoiceNumber = invoiceNumber,
                        IssueDate = issueDate,
                        DueDate = dueDate,
                        LaborCost = intervention.LaborCost,
                        PartsCost = intervention.InterventionParts.Sum(ip => ip.GetTotalPrice())
                    })
                )
            );
            return await MapToDtoAsync(invoice);
        }

        public async Task<decimal> GetGlobalLaborCostAsync()
        {
            return Invoice.GlobalLaborCost;
        }

        public async Task SetGlobalLaborCostAsync(decimal laborCost)
        {
            Invoice.SetGlobalLaborCost(laborCost);

            // Optional: Save to database if you want to persist this setting
            // You would need to add a new repository method for this
            await _unitOfWork.SaveChangesAsync();

            await _historyService.AddHistoryAsync(
                new History(
                    "GlobalLaborCostUpdated",
                    nameof(Invoice),
                    Guid.Empty, // No specific entity ID
                    GetCurrentUserId(),
                    JsonSerializer.Serialize(new { NewGlobalLaborCost = laborCost })
                )
            );
        }
        private async Task<InvoiceDto> MapToDtoAsync(Invoice invoice)
        {
            if (invoice == null) return null;

            var intervention = await _unitOfWork.Interventions.GetByIdAsync(invoice.InterventionId);
            var payments = await _unitOfWork.InvoicePayments.GetByInvoiceIdAsync(invoice.Id);

            var dto = new InvoiceDto
            {
                Id = invoice.Id,
                InterventionId = invoice.InterventionId,
                InvoiceNumber = invoice.InvoiceNumber,
                IssueDate = invoice.IssueDate,
                DueDate = invoice.DueDate,
                LaborCost = invoice.LaborCost,
                TotalPartsCost = invoice.TotalPartsCost,
                TotalAmount = invoice.TotalAmount,
                Status = invoice.Status,
                CreatedAt = invoice.CreatedAt,
                UpdatedAt = invoice.UpdatedAt,
                Payments = payments.Select(p => MapToPaymentDto(p)).ToList()
            };

            try
            {
                var payment = await _unitOfWork.InvoicePayments.GetByInvoiceIdAsync(invoice.Id);
                dto.Payments = payment?.Select(MapToPaymentDto).ToList() ?? new List<InvoicePaymentDto>();
            }
            catch
            {
                dto.Payments = new List<InvoicePaymentDto>();
            }

            if (intervention != null)
            {
                var client = await _unitOfWork.Clients.GetByIdAsync(intervention.ClientId);
                var technician = intervention.TechnicianId.HasValue ?
                    await _unitOfWork.Technicians.GetByIdAsync(intervention.TechnicianId.Value) : null;

                dto.Intervention = new InterventionDto
                {
                    Id = intervention.Id,
                    Description = intervention.Description,
                    StartDate = intervention.StartDate,
                    EndDate = intervention.EndDate,
                    Status = intervention.Status,
                    ClientId = intervention.ClientId,
                    TechnicianId = intervention.TechnicianId,
                    CreatedAt = intervention.CreatedAt,
                    UpdatedAt = intervention.UpdatedAt,
                    Client = client != null ? new ClientDto
                    {
                        Id = client.Id,
                        Name = client.Name,
                        Email = client.Email,
                        Phone = client.Phone,
                        Address = client.Address
                    } : null,
                    Technician = technician != null ? new TechnicianDto
                    {
                        Id = technician.Id,
                        Name = technician.Name,
                        Email = technician.Email,
                        Phone = technician.Phone,
                        Specialization = technician.Specialization
                    } : null
                };
            }

            return dto;
        }

        private async Task<IEnumerable<InvoiceDto>> MapToDtoListAsync(IEnumerable<Invoice> invoices)
        {
            var dtos = new List<InvoiceDto>();
            foreach (var invoice in invoices)
            {
                dtos.Add(await MapToDtoAsync(invoice));
            }
            return dtos;
        }

        private InvoicePaymentDto MapToPaymentDto(InvoicePayment payment)
        {
            return new InvoicePaymentDto
            {
                Id = payment.Id,
                InvoiceId = payment.InvoiceId,
                Amount = payment.Amount,
                PaymentDate = payment.PaymentDate,
                PaymentMethod = payment.PaymentMethod,
                Reference = payment.Reference,
                CreatedAt = payment.CreatedAt,
                UpdatedAt = payment.UpdatedAt
            };
        }
    }
}
