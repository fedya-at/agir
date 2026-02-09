using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Apis.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminsController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminsController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        // GET: api/Admins
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetAdmins()
        {
            var admins = await _adminService.GetAllAdminsAsync();
            return Ok(admins);
        }

        // GET: api/Admins/5
        [HttpGet("{id}")]
        public async Task<ActionResult<UserDto>> GetAdmin(Guid id)
        {
            var admin = await _adminService.GetAdminByIdAsync(id);
            if (admin == null) return NotFound();
            return Ok(admin);
        }

        // --- NEW ENDPOINT: POST api/Admins ---
        [HttpPost]
        public async Task<ActionResult<UserDto>> CreateAdmin([FromBody] CreateUserDto adminDto)
        {
            try
            {
                var newAdmin = await _adminService.AddAdminAsync(adminDto);
                return CreatedAtAction(nameof(GetAdmin), new { id = newAdmin.Id }, newAdmin);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        // --- NEW ENDPOINT: PUT api/Admins/5 ---
        [HttpPut("{id}")]
        public async Task<ActionResult<UserDto>> UpdateAdmin(Guid id, [FromBody] UpdateUserDto adminDto)
        {
            try
            {
                var updatedAdmin = await _adminService.UpdateAdminAsync(id, adminDto);
                return Ok(updatedAdmin);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        // --- NEW ENDPOINT: DELETE api/Admins/5 ---
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAdmin(Guid id)
        {
            var success = await _adminService.DeleteAdminAsync(id);
            if (!success)
            {
                return NotFound(new { message = "Admin not found." });
            }
            return NoContent(); // Standard response for a successful delete
        }
    }
}
