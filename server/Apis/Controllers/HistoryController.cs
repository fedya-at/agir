using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Require authentication for all endpoints
    public class HistoryController : ControllerBase
    {
        private readonly IHistoryService _historyService;
        private readonly ILogger<HistoryController> _logger;

        public HistoryController(IHistoryService historyService, ILogger<HistoryController> logger)
        {
            _historyService = historyService ?? throw new ArgumentNullException(nameof(historyService));
            _logger = logger;
        }
        [HttpGet("all")]
        public async Task<ActionResult<PagedResult<HistoryDto>>> GetAllHistory(
    [FromQuery] int pageNumber = 1,
    [FromQuery] int pageSize = 100,
    CancellationToken cancellationToken = default)
        {
            try
            {
                var result = await _historyService.GetAllHistoryAsync(pageNumber, pageSize, cancellationToken);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all history records");
                return StatusCode(500, new ProblemDetails
                {
                    Title = "Internal Server Error",
                    Detail = "An error occurred while retrieving all history records",
                    Status = StatusCodes.Status500InternalServerError
                });
            }
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<HistoryDto>>> GetHistory(
     [FromQuery] HistoryFilterSortDto filterSortDto = null,
     CancellationToken cancellationToken = default)
        {
            try
            {
                // If no filter parameters are provided, get all history
                var result = await _historyService.GetHistoryAsync(filterSortDto, cancellationToken);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving history");
                return StatusCode(500, new ProblemDetails
                {
                    Title = "Internal Server Error",
                    Detail = "An error occurred while retrieving history records",
                    Status = StatusCodes.Status500InternalServerError
                });
            }
        }
        [HttpGet("entity/{entityId}")]
        public async Task<ActionResult<IEnumerable<HistoryDto>>> GetByEntityId(
            Guid entityId,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var result = await _historyService.GetByEntityIdAsync(entityId, cancellationToken);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("entity/{entityName}/{entityId}")]
        public async Task<ActionResult<IEnumerable<HistoryDto>>> GetByEntity(
            string entityName,
            Guid entityId,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var result = await _historyService.GetByEntityAsync(entityName, entityId, cancellationToken);
                return Ok(result);
            }
            catch (ArgumentNullException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<HistoryDto>>> GetByUser(
            Guid userId,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var result = await _historyService.GetByUserAsync(userId, cancellationToken);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("entity-name/{entityName}")]
        public async Task<ActionResult<IEnumerable<HistoryDto>>> GetByEntityName(
            string entityName,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var result = await _historyService.GetByEntityNameAsync(entityName, cancellationToken);
                return Ok(result);
            }
            catch (ArgumentNullException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult> AddHistory(
            [FromBody] HistoryDto historyDto,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var history = new History(
                    action: historyDto.Action,
                    entityName: historyDto.EntityName,
                    entityId: historyDto.EntityId,
                    userId: historyDto.UserId,
                    changes: historyDto.Changes);

                await _historyService.AddHistoryAsync(history, cancellationToken);
                return CreatedAtAction(nameof(GetByEntityId), new { entityId = history.EntityId }, historyDto);
            }
            catch (ArgumentNullException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        [HttpGet("export/pdf")]
        public async Task<IActionResult> ExportHistoryToPdf()
        {
            try
            {
                var fileBytes = await _historyService.ExportHistoryToPdfAsync();
                return File(fileBytes, "application/pdf", "HistoryReport.pdf");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting history to PDF");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("export/excel")]
        public async Task<IActionResult> ExportHistoryToExcel()
        {
            try
            {
                // Add content disposition header for immediate download
                Response.Headers.Append("Content-Disposition", "attachment; filename=HistoryReport.xlsx");

                var fileBytes = await _historyService.ExportHistoryToExcelAsync();
                return File(fileBytes,
                           "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                           $"HistoryReport_{DateTime.Now:yyyyMMddHHmmss}.xlsx");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting history to Excel");
                return StatusCode(StatusCodes.Status500InternalServerError,
                                new { Message = "An error occurred while generating the Excel report" });
            }
        }

        [HttpGet("export/csv")]
        public async Task<IActionResult> ExportHistoryToCsv()
        {
            try
            {
                // Add content disposition header for immediate download
                Response.Headers.Append("Content-Disposition", "attachment; filename=HistoryReport.csv");

                var fileBytes = await _historyService.ExportHistoryToCsvAsync();
                return File(fileBytes,
                           "text/csv",
                           $"HistoryReport_{DateTime.Now:yyyyMMddHHmmss}.csv");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting history to CSV");
                return StatusCode(StatusCodes.Status500InternalServerError,
                                new { Message = "An error occurred while generating the CSV report" });
            }
        }
    }
}