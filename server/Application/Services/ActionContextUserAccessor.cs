using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    // IActionContextUserAccessor.cs
    public interface IActionContextUserAccessor
    {
        Guid? GetCurrentUserId();
    }

    // ActionContextUserAccessor.cs
    public class ActionContextUserAccessor : IActionContextUserAccessor
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ActionContextUserAccessor(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public Guid? GetCurrentUserId()
        {
            // Get user ID from claims if available
            var userIdClaim = _httpContextAccessor.HttpContext?.User?
                .FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (Guid.TryParse(userIdClaim, out var userId))
            {
                return userId;
            }
            return null;
        }
    }
}
