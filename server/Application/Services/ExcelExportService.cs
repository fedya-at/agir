// ExcelExportService.cs
using Application.DTOs;
using Application.Interfaces;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Globalization;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Domain.Enums;
using System.Text;

namespace Application.Services
{
    public class ExcelExportService : IExcelExportService
    {
        private readonly IUserService _userService;
        private readonly ITechnicianService _technicianService;
        private readonly IClientService _clientService;

        public ExcelExportService(
            IUserService userService,
            ITechnicianService technicianService,
            IClientService clientService)
        {
            _userService = userService;
            _technicianService = technicianService;
            _clientService = clientService;
        }

        public byte[] ExportToExcel<T>(IEnumerable<T> data, string sheetName)
        {
            ExcelPackage.License.SetNonCommercialPersonal("Lab-It"); //This will also set the Company property to the organization name provided in the argument.

            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add(sheetName ?? "Export");

            var properties = typeof(T).GetProperties();

            // Add header
            for (int i = 0; i < properties.Length; i++)
            {
                worksheet.Cells[1, i + 1].Value = FormatPropertyName(properties[i].Name);
                worksheet.Cells[1, i + 1].Style.Font.Bold = true;
                worksheet.Cells[1, i + 1].Style.Fill.PatternType = ExcelFillStyle.Solid;
                worksheet.Cells[1, i + 1].Style.Fill.BackgroundColor.SetColor(Color.LightBlue);
                worksheet.Cells[1, i + 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            }

            // Add data
            var row = 2;
            foreach (var item in data)
            {
                for (int i = 0; i < properties.Length; i++)
                {
                    var value = properties[i].GetValue(item)?.ToString();
                    var formattedValue = FormatCellValue(value, properties[i].PropertyType, properties[i].Name).Result;
                    worksheet.Cells[row, i + 1].Value = formattedValue;

                    // Formatting
                    if (properties[i].PropertyType == typeof(DateTime) ||
                        properties[i].PropertyType == typeof(DateTime?))
                    {
                        worksheet.Cells[row, i + 1].Style.Numberformat.Format = "yyyy-mm-dd hh:mm:ss";
                    }
                    else if (properties[i].PropertyType == typeof(decimal) ||
                             properties[i].PropertyType == typeof(double) ||
                             properties[i].PropertyType == typeof(float))
                    {
                        worksheet.Cells[row, i + 1].Style.Numberformat.Format = "#,##0.00";
                    }
                }
                row++;
            }

            // Auto-fit columns with minimum width
            worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns(12); // Minimum width of 12

            return package.GetAsByteArray();
        }

        private string FormatPropertyName(string propertyName)
        {
            return propertyName switch
            {
                "UserId" => "UTILISATEUR",
                "EntityId" => "ID ENTITÉ",
                "EntityName" => "ENTITÉ",
                "Timestamp" => "DATE/HEURE",
                "Changes" => "DÉTAILS",
                _ => System.Text.RegularExpressions.Regex.Replace(
                    propertyName, "([a-z])([A-Z])", "$1 $2").ToUpper()
            };
        }

        private async Task<string> FormatCellValue(string value, Type propertyType, string propertyName)
        {
            if (string.IsNullOrEmpty(value)) return "-";

            if (propertyName == "Changes") return await FormatChangesFieldAsync(value);
            if (IsGuidProperty(propertyName) && Guid.TryParse(value, out var guid))
                return await ResolveGuidAsync(guid, propertyName);

            return FormatStandardValue(value, propertyType);
        }

        private async Task<string> FormatChangesFieldAsync(string changesJson)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(changesJson)) return "No changes";

                var changes = JsonConvert.DeserializeObject<Dictionary<string, object>>(changesJson);
                var result = new StringBuilder();

                foreach (var change in changes)
                {
                    var formattedValue = await FormatChangeValueAsync(change.Key, change.Value);
                    result.Append($"{FormatPropertyName(change.Key)}: {formattedValue}\n");
                }

                return result.ToString().Trim();
            }
            catch
            {
                return changesJson.Length > 100 ? changesJson.Substring(0, 97) + "..." : changesJson;
            }
        }

        private async Task<string> FormatChangeValueAsync(string key, object value)
        {
            if (value == null) return "null";

            var stringValue = value.ToString();

            if (key.Contains("Status") && int.TryParse(stringValue, out var status))
                return ((InterventionStatus)status).ToString();

            if (key.Contains("Date") && DateTime.TryParse(stringValue, out var date))
                return date.ToString("MMM dd, yyyy hh:mm:ss tt");

            if (Guid.TryParse(stringValue, out var guid))
                return await ResolveGuidAsync(guid, key);

            return stringValue;
        }

        private async Task<string> ResolveGuidAsync(Guid guid, string context = null)
        {
            try
            {
                var technician = await _technicianService.GetTechnicianByIdAsync(guid)
                              ?? (context != "UserId" ? await _technicianService.GetTechnicianByIdAsync(guid) : null);
                if (technician != null) return $"TECH: {technician.Name}";

                var client = await _clientService.GetClientByIdAsync(guid)
                           ?? (context != "UserId" ? await _clientService.GetClientByIdAsync(guid) : null);
                if (client != null) return $"CLIENT: {client.Name}";

                var user = await _userService.GetUserByIdAsync(guid);
                if (user != null)
                {
                    return user.Role switch
                    {
                        UserRole.Admin => $"ADMIN: {user.Username}",
                        UserRole.Technician => $"TECH: {user.Username}",
                        UserRole.Client => $"CLIENT: {user.Username}",
                        _ => $"USER: {user.Username}"
                    };
                }

                return guid.ToString();
            }
            catch
            {
                return guid.ToString();
            }
        }

        private string FormatStandardValue(string value, Type propertyType)
        {
            if (propertyType == typeof(decimal) || propertyType == typeof(decimal?) ||
                propertyType == typeof(double) || propertyType == typeof(double?) ||
                propertyType == typeof(float) || propertyType == typeof(float?))
            {
                if (decimal.TryParse(value, out decimal numValue))
                    return numValue.ToString("N2", CultureInfo.InvariantCulture);
            }

            if (propertyType == typeof(DateTime) || propertyType == typeof(DateTime?))
            {
                if (DateTime.TryParse(value, out DateTime dateValue))
                    return dateValue.ToString("MMM dd, yyyy HH:mm", CultureInfo.InvariantCulture);
            }

            if (propertyType == typeof(bool) || propertyType == typeof(bool?))
            {
                if (bool.TryParse(value, out bool boolValue))
                    return boolValue ? "✓" : "✗";
            }

            return value.Length > 50 ? value.Substring(0, 47) + "..." : value;
        }

        private bool IsGuidProperty(string propertyName)
        {
            return propertyName.EndsWith("Id", StringComparison.OrdinalIgnoreCase) ||
                   propertyName.Equals("UserId", StringComparison.OrdinalIgnoreCase);
        }
    }
}