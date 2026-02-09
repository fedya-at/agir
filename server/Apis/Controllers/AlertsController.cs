using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces.Repositories;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Apis.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AlertsController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly INotificationDispatcher _notificationDispatcher;

        public AlertsController(IUnitOfWork unitOfWork, INotificationDispatcher notificationDispatcher)
        {
            _unitOfWork = unitOfWork;
            _notificationDispatcher = notificationDispatcher;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AlertDto>>> GetAlerts()
        {
            var lowStockParts = await _unitOfWork.Parts.GetLowStockAsync();

            // Use the new GetActiveAlertsAsync method from the repository
            var lowStockPartIds = lowStockParts.Select(p => p.Id).ToList();

            // Then get only alerts for these parts
            var activeAlerts = await _unitOfWork.Alerts.FindAsync(a =>
                lowStockPartIds.Contains(a.PartId) &&
                (a.Status == AlertStatus.Pending || a.Status == AlertStatus.Sent || a.Status == AlertStatus.Escalated)
            );

            // Map to DTOs
            var alertDtos = activeAlerts.Select(alert => new AlertDto
            {
                Id = alert.Id,
                UpdatedAt = alert.UpdatedAt,
                PartId = alert.PartId,
                PartName = alert.PartName,
                CurrentStock = alert.CurrentStock,
                Threshold = alert.Threshold,
                Message = alert.Message,
                Status = (AlertStatus)(int)alert.Status, // Cast to int for DTO
                CreatedAt = alert.CreatedAt,
                SentAt = alert.SentAt,
                AcknowledgedAt = alert.AcknowledgedAt,
                IsEscalated = alert.IsEscalated
            });

            return Ok(alertDtos);
        }
        [HttpPost("{id}/acknowledge")]
        public async Task<IActionResult> AcknowledgeAlert(Guid id)
        {
            var alert = await _unitOfWork.Alerts.GetByIdAsync(id);
            if (alert == null)
            {
                return NotFound();
            }

            alert.Status = AlertStatus.Acknowledged;
            alert.AcknowledgedAt = DateTime.UtcNow;

            await _unitOfWork.Alerts.UpdateAsync(alert);
            await _unitOfWork.SaveChangesAsync();

            return Ok();
        }

    }
}