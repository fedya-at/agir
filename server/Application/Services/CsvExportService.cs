// CsvExportService.cs
using Application.DTOs;
using Application.Interfaces;
using CsvHelper;
using Domain.Enums;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System.Text;

namespace Application.Services
{
    public class CsvExportService : ICsvExportService
    {
        private readonly IUserService _userService;
        private readonly ITechnicianService _technicianService;
        private readonly IClientService _clientService;

        public CsvExportService(
            IUserService userService,
            ITechnicianService technicianService,
            IClientService clientService)
        {
            _userService = userService;
            _technicianService = technicianService;
            _clientService = clientService;
        }

        public async Task<byte[]> ExportToCsv<T>(IEnumerable<T> data)
        {
            using var memoryStream = new MemoryStream();
            using var streamWriter = new StreamWriter(memoryStream);
            using var csvWriter = new CsvWriter(streamWriter, CultureInfo.InvariantCulture);

            // Write header
            csvWriter.WriteHeader<T>();
            await csvWriter.NextRecordAsync();

            // Process and write records
            foreach (var item in data)
            {
                // Write the entire record synchronously
                csvWriter.WriteRecord(await ProcessRecordForCsv(item));
                await csvWriter.NextRecordAsync();
            }

            await streamWriter.FlushAsync();
            memoryStream.Position = 0;
            return memoryStream.ToArray();
        }

        private async Task<object> ProcessRecordForCsv<T>(T record)
        {
            var processedRecord = new Dictionary<string, object>();
            var properties = typeof(T).GetProperties();

            foreach (var prop in properties)
            {
                var value = prop.GetValue(record)?.ToString();
                var formattedValue = await FormatCellValueAsync(value, prop.PropertyType, prop.Name);
                processedRecord[prop.Name] = formattedValue;
            }

            return processedRecord;
        }

        private async Task<string> FormatCellValueAsync(string value, Type propertyType, string propertyName)
        {
            if (string.IsNullOrEmpty(value) || value == "0") return "-";

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
                    result.Append($"{change.Key}: {formattedValue}; ");
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