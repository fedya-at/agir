using Application.DTOs;
using Application.Interfaces;
using Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Apis.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class InvoicesController : ControllerBase
    {
        private readonly IInvoiceService _invoiceService;
        private readonly IClientService _clientService;
        private readonly ITechnicianService _technicianService;
        private readonly ILogger<InvoicesController> _logger;

        public InvoicesController(
            IInvoiceService invoiceService,
            IClientService clientService,
            ITechnicianService technicianService,
            ILogger<InvoicesController> logger)
        {
            _invoiceService = invoiceService ?? throw new ArgumentNullException(nameof(invoiceService));
            _clientService = clientService ?? throw new ArgumentNullException(nameof(clientService));
            _technicianService = technicianService ?? throw new ArgumentNullException(nameof(technicianService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        // GET: api/Invoices
        [HttpGet]
        [Authorize(Roles = "Admin,Technician")]
        public async Task<ActionResult<IEnumerable<InvoiceDto>>> GetInvoices()
        {
            var invoices = await _invoiceService.GetAllInvoicesAsync();
            return Ok(invoices);
        }

        // GET: api/Invoices/5
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Technician,Client")]
        public async Task<ActionResult<InvoiceDto>> GetInvoice(Guid id)
        {
            var invoice = await _invoiceService.GetInvoiceByIdAsync(id);

            if (invoice == null)
            {
                return NotFound();
            }
            var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value);

            if (User.IsInRole("Client"))
            {
                var client = await _clientService.GetClientByIdAsync(userId);
                if (client == null || invoice.Intervention?.ClientId != client.Id)
                {
                    return Forbid();
                }
            }

            if (User.IsInRole("Technician"))
            {
                var technician = await _technicianService.GetTechnicianByIdAsync(userId);
                if (technician == null || invoice.Intervention?.TechnicianId != technician.Id)
                {
                    return Forbid();
                }
            }

            return Ok(invoice);
        }

        // GET: api/Invoices/number/INV-2023-001
        [HttpGet("number/{invoiceNumber}")]
        [Authorize(Roles = "Admin,Technician")]
        public async Task<ActionResult<InvoiceDto>> GetInvoiceByNumber(string invoiceNumber)
        {
            var invoice = await _invoiceService.GetInvoiceByInvoiceNumberAsync(invoiceNumber);

            if (invoice == null)
            {
                return NotFound();
            }

            return Ok(invoice);
        }

        [HttpGet("intervention/{interventionId}")]
        [Authorize(Roles = "Admin,Technician,Client")]
        public async Task<ActionResult<InvoiceDto>> GetInvoiceByInterventionId(Guid interventionId)
        {
            try
            {
                var invoice = await _invoiceService.GetInvoiceByInterventionIdAsync(interventionId);

                if (invoice == null)
                {
                    return NotFound("No invoice found for this intervention");
                }

                var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

                // Admin bypasses all checks
                if (!User.IsInRole("Admin"))
                {
                    if (User.IsInRole("Client"))
                    {
                        var client = await _clientService.GetClientByIdAsync(userId);
                        if (client == null || invoice.Intervention?.ClientId != client.Id)
                        {
                            return Forbid();
                        }
                    }

                    if (User.IsInRole("Technician"))
                    {
                        var technician = await _technicianService.GetTechnicianByIdAsync(userId);
                        if (technician == null)
                        {
                            return Forbid("Technician profile not found");
                        }

                        // Check if technician is assigned to this intervention
                        if (invoice.Intervention?.TechnicianId != technician.Id)
                        {
                            return Forbid("Technician not assigned to this intervention");
                        }
                    }
                }

                return Ok(invoice);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetInvoiceByInterventionId for interventionId: {InterventionId}", interventionId);
                return StatusCode(500, "Internal server error");
            }
        }

        // GET: api/Invoices/status/Issued
        [HttpGet("status/{status}")]
        [Authorize(Roles = "Admin,Technician ")]
        public async Task<ActionResult<IEnumerable<InvoiceDto>>> GetInvoicesByStatus(InvoiceStatus status)
        {
            var invoices = await _invoiceService.GetInvoicesByStatusAsync(status);
            return Ok(invoices);
        }

        // GET: api/Invoices/daterange?startDate=2023-01-01&endDate=2023-12-31
        [HttpGet("daterange")]
        [Authorize(Roles = "Admin,Technician")]
        public async Task<ActionResult<IEnumerable<InvoiceDto>>> GetInvoicesByDateRange(
            [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            var invoices = await _invoiceService.GetInvoicesByDateRangeAsync(startDate, endDate);
            return Ok(invoices);
        }

        // GET: api/Invoices/overdue
        [HttpGet("overdue")]
        [Authorize(Roles = "Admin,Technician")]
        public async Task<ActionResult<IEnumerable<InvoiceDto>>> GetOverdueInvoices()
        {
            var invoices = await _invoiceService.GetOverdueInvoicesAsync();
            return Ok(invoices);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Technician")]
        public async Task<ActionResult<InvoiceDto>> CreateInvoice(CreateInvoiceDto invoiceDto)
        {
            try
            {
                var createdInvoice = await _invoiceService.CreateInvoiceAsync(invoiceDto);
                return CreatedAtAction(nameof(GetInvoice), new { id = createdInvoice.Id }, createdInvoice);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Conflict when creating invoice: {@InvoiceDto}", invoiceDto);
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when creating invoice: {@InvoiceDto}", invoiceDto);
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        // PUT: api/Invoices/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Technician")]
        public async Task<IActionResult> UpdateInvoice(Guid id, UpdateInvoiceDto invoiceDto)
        {
            try
            {
                var updatedInvoice = await _invoiceService.UpdateInvoiceAsync(id, invoiceDto);
                return Ok(updatedInvoice);
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
            {
                _logger.LogWarning(ex, "Invoice not found for update: {InvoiceId}", id);
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Conflict when updating invoice: {InvoiceId}", id);
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when updating invoice: {InvoiceId}", id);
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        // DELETE: api/Invoices/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Technician")]
        public async Task<IActionResult> DeleteInvoice(Guid id)
        {
            try
            {
                await _invoiceService.DeleteInvoiceAsync(id);
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invoice not found for delete: {InvoiceId}", id);
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when deleting invoice: {InvoiceId}", id);
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        // PUT: api/Invoices/5/issue
        [HttpPut("{id}/issue")]
        [Authorize(Roles = "Admin,Technician")]
        public async Task<IActionResult> IssueInvoice(Guid id)
        {
            try
            {
                var invoice = await _invoiceService.IssueInvoiceAsync(id);
                return Ok(invoice);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Bad request when issuing invoice: {InvoiceId}", id);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when issuing invoice: {InvoiceId}", id);
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        // PUT: api/Invoices/5/markpaid
        [HttpPut("{id}/markpaid")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> MarkInvoiceAsPaid(Guid id)
        {
            try
            {
                var invoice = await _invoiceService.MarkInvoiceAsPaidAsync(id);
                return Ok(invoice);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Bad request when marking invoice as paid: {InvoiceId}", id);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when marking invoice as paid: {InvoiceId}", id);
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        // PUT: api/Invoices/5/cancel
        [HttpPut("{id}/cancel")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CancelInvoice(Guid id)
        {
            try
            {
                var invoice = await _invoiceService.CancelInvoiceAsync(id);
                return Ok(invoice);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Bad request when canceling invoice: {InvoiceId}", id);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when canceling invoice: {InvoiceId}", id);
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        // POST: api/Invoices/5/payments
        [HttpPost("{id}/payments")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddPayment(Guid id, CreateInvoicePaymentDto paymentDto)
        {
            try
            {
                var invoice = await _invoiceService.AddPaymentAsync(id, paymentDto);
                return Ok(invoice);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Bad request when adding payment to invoice: {InvoiceId}", id);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when adding payment to invoice: {InvoiceId}", id);
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        // GET: api/Invoices/5/payments
        [HttpGet("{id}/payments")]
        [Authorize(Roles = "Admin,Client")]
        public async Task<ActionResult<IEnumerable<InvoicePaymentDto>>> GetInvoicePayments(Guid id)
        {
            try
            {
                // If user is a client, they can only view payments for their own invoices
                if (User.IsInRole("Client"))
                {
                    var invoice = await _invoiceService.GetInvoiceByIdAsync(id);
                    if (invoice == null)
                    {
                        return NotFound();
                    }

                    var client = await _clientService.GetClientByIdAsync(
                        Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value));

                    if (client == null || invoice.Intervention?.ClientId != client.Id)
                    {
                        return Forbid();
                    }
                }

                var payments = await _invoiceService.GetInvoicePaymentsAsync(id);
                return Ok(payments);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invoice not found when getting payments: {InvoiceId}", id);
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when getting payments for invoice: {InvoiceId}", id);
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        // GET: api/Invoices/5/pdf
        [HttpGet("{id}/pdf")]
        [Authorize(Roles = "Admin,Technician,Client")]
        public async Task<IActionResult> GetInvoicePdf(Guid id)
        {
            try
            {
                var invoice = await _invoiceService.GetInvoiceByIdAsync(id);
                if (invoice == null)
                {
                    return NotFound();
                }

                var pdfBytes = await _invoiceService.GenerateInvoicePdfAsync(id);
                return File(pdfBytes, "application/pdf", $"Invoice-{invoice.InvoiceNumber}.pdf");
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invoice not found when generating PDF: {InvoiceId}", id);
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when generating PDF for invoice: {InvoiceId}", id);
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        // POST: api/Invoices/generate/intervention/{interventionId}
        [HttpPost("generate/intervention/{interventionId}")]
        [Authorize(Roles = "Admin,Technician")]
        public async Task<ActionResult<InvoiceDto>> GenerateInvoiceForIntervention(Guid interventionId)
        {
            try
            {
                var invoice = await _invoiceService.GenerateInvoiceForInterventionAsync(interventionId);
                return CreatedAtAction(nameof(GetInvoice), new { id = invoice.Id }, invoice);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Bad request when generating invoice for intervention: {InterventionId}", interventionId);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when generating invoice for intervention: {InterventionId}", interventionId);
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }



        // GET: api/Invoices/global-labor-cost

        [HttpGet("global-labor-cost")]
        [Authorize(Roles = "Admin,Technician")]
        public async Task<ActionResult<decimal>> GetGlobalLaborCost()
        {
            try
            {
                var laborCost = await _invoiceService.GetGlobalLaborCostAsync();
                return Ok(laborCost);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting global labor cost");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Error getting global labor cost" });
            }
        }

        // PUT: api/Invoices/global-labor-cost
        [HttpPut("global-labor-cost")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SetGlobalLaborCost([FromBody] UpdateGlobalLaborCostDto dto)
        {
            try
            {
                await _invoiceService.SetGlobalLaborCostAsync(dto.LaborCost);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid labor cost value: {LaborCost}", dto.LaborCost);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting global labor cost to {LaborCost}", dto.LaborCost);
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Error setting global labor cost" });
            }
        }


    }



}
