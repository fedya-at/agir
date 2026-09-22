using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Globalization;
using Application.Interfaces;
using Application.DTOs;
using System.Threading.Tasks;
using System.Text;
using Newtonsoft.Json;
using Domain.Enums;

namespace Application.Services
{
    public class PdfExportService : IPdfExportService
    {
        private readonly IUserService _userService;
        private readonly ITechnicianService _technicianService;
        private readonly IClientService _clientService;

        public PdfExportService(
            IUserService userService,
            ITechnicianService technicianService,
            IClientService clientService)
        {
            _userService = userService;
            _technicianService = technicianService;
            _clientService = clientService;
        }

        public async Task<byte[]> ExportToPdf<T>(IEnumerable<T> data, string title)
        {
            QuestPDF.Settings.EnableDebugging = true;
            QuestPDF.Settings.License = LicenseType.Community;

            try
            {
                var processedData = await ProcessDataAsync(data);

                var document = Document.Create(container =>
                {
                    container.Page(page =>
                    {
                        // Landscape orientation
                        page.Size(PageSizes.A4.Landscape());
                        page.Margin(20, Unit.Millimetre);
                        page.PageColor(Colors.White);
                        page.DefaultTextStyle(x => x.FontFamily(Fonts.Calibri).FontSize(10));

                        // Enhanced header with logo and title
                        page.Header()
                            .PaddingVertical(15)
                            .Background(Colors.Blue.Darken3)
                            .Row(row =>
                            {
                                row.RelativeItem()
                                    .Column(column =>
                                    {
                                        column.Item().Text(title)
                                            .FontColor(Colors.White)
                                            .Bold()
                                            .FontSize(18);

                                        column.Item().Text(DateTime.Now.ToString("MMMM dd, yyyy HH:mm"))
                                            .FontColor(Colors.White)
                                            .FontSize(10);
                                    });

                                row.ConstantItem(100)
                                    .AlignRight()
                                    .Image(Placeholders.Image(200, 100))
                                    .FitArea();
                            });

                        // Main content
                        page.Content().Column(column =>
                        {
                            var properties = typeof(T).GetProperties();
                            var dataList = data.ToList();

                            // Summary section with improved styling
                            column.Item().PaddingBottom(15).Background(Colors.Grey.Lighten3).Border(1).BorderColor(Colors.Grey.Lighten1).Padding(10).Column(summary =>
                            {
                                summary.Item().Text("RÉSUMÉ DU RAPPORT").Bold().FontSize(12).FontColor(Colors.Blue.Darken3);
                                summary.Item().PaddingTop(5).Row(row =>
                                {
                                    row.RelativeItem().Text($"Nombre total d'enregistrements : {dataList.Count}").FontSize(10);
                                    row.RelativeItem().Text($"Généré par : Système").FontSize(10).AlignRight();
                                });

                            });

                            // Table with improved layout
                            column.Item().Table(table =>
                            {
                                // Auto column sizing with minimum widths
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.ConstantColumn(25); // Index column
                                    foreach (var prop in properties)
                                    {
                                        var minWidth = prop.Name switch
                                        {
                                            "Changes" => 150,
                                            "UserId" => 50,
                                            "Timestamp" => 70,
                                            "Action" => 60,
                                            "EntityName" => 50,
                                            _ => 60 // Default width
                                        };
                                        columns.RelativeColumn(minWidth);
                                    }
                                });

                                // Table header with improved styling
                                table.Header(header =>
                                {
                                    header.Cell().Element(CellStyle).Text("N°").FontSize(9);

                                    foreach (var prop in properties)
                                    {
                                        header.Cell().Element(CellStyle)
                                            .Text(FormatPropertyName(prop.Name))
                                            .FontSize(9);
                                    }

                                    static IContainer CellStyle(IContainer container)
                                    {
                                        return container
                                            .Border(1)
                                            .BorderColor(Colors.Grey.Lighten1)
                                            .Background(Colors.Blue.Darken2)
                                            .PaddingVertical(5)
                                            .PaddingHorizontal(2)
                                            .AlignCenter()
                                            .AlignMiddle()
                                            .ShowOnce();
                                    }
                                });

                                // Table rows with alternating colors
                                var rowIndex = 0;
                                foreach (var item in processedData)
                                {
                                    var isEvenRow = rowIndex % 2 == 0;
                                    var backgroundColor = isEvenRow ? Colors.White : Colors.Grey.Lighten4;

                                    // Index column
                                    table.Cell()
                                        .Element(CellStyle)
                                        .Background(backgroundColor)
                                        .Text((rowIndex + 1).ToString())
                                        .FontSize(8);

                                    foreach (var prop in item.Properties)
                                    {
                                        table.Cell()
                                            .Element(CellStyle)
                                            .Background(backgroundColor)
                                            .Text(prop.Value)
                                            .FontSize(8);
                                    }

                                    rowIndex++;

                                    static IContainer CellStyle(IContainer container)
                                    {
                                        return container
                                            .Border(1)
                                            .BorderColor(Colors.Grey.Lighten2)
                                            .PaddingVertical(3)
                                            .PaddingHorizontal(2);
                                    }
                                }
                            });
                        });


                        page.Footer()
     .AlignCenter()
     .Text(x =>
     {
         x.Span("Page ")
             .FontSize(9)
             .FontColor(Colors.Grey.Darken1);

         x.CurrentPageNumber()
             .FontSize(9)
             .FontColor(Colors.Grey.Darken1);

         x.Span(" of ")
             .FontSize(9)
             .FontColor(Colors.Grey.Darken1);

         x.TotalPages()
             .FontSize(9)
             .FontColor(Colors.Grey.Darken1);
     });
                    });
                });

                var pdfBytes = document.GeneratePdf();
                return pdfBytes;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"PDF Generation Error: {ex}");
                throw;
            }
        }



        private string FormatPropertyName(string propertyName)
        {
            if (string.IsNullOrEmpty(propertyName))
                return propertyName;

            // Custom display names for properties
            return propertyName switch
            {
                "UserId" => "UTILISATEUR",
                "EntityId" => "ID ENTITÉ",
                "EntityName" => "ENTITÉ",
                "Timestamp" => "DATE/HEURE",
                "Changes" => "DÉTAILS",
                _ => System.Text.RegularExpressions.Regex.Replace(
                    propertyName,
                    "([a-z])([A-Z])",
                    "$1 $2").ToUpper()
            };
        }


        private async Task<string> FormatCellValueAsync(string value, Type propertyType, string propertyName)
        {
            if (string.IsNullOrEmpty(value) || value == "0")
                return "-";

            if (propertyName == "Changes")
                return await FormatChangesFieldAsync(value);

            if (IsGuidProperty(propertyName) && Guid.TryParse(value, out var guid))
                return await ResolveGuidAsync(guid, propertyName);

            return FormatStandardValue(value, propertyType);
        }
        private async Task<string> FormatChangeValueAsync(string key, object value)
        {
            if (value == null)
                return "null";

            var stringValue = value.ToString();

            // Handle status fields
            if (key.Contains("Status", StringComparison.OrdinalIgnoreCase))
            {
                return FormatStatusValue(stringValue);
            }
            if (key.Equals("UserId", StringComparison.OrdinalIgnoreCase) &&
                Guid.TryParse(stringValue, out var userId))
            {
                return await ResolveGuidAsync(userId, key);
            }

            // Handle date fields
            if (key.Contains("Date", StringComparison.OrdinalIgnoreCase) &&
                DateTime.TryParse(stringValue, out var dateValue))
            {
                return dateValue.ToString("MMM dd, yyyy hh:mm:ss tt");
            }

            // Handle GUID fields
            if (Guid.TryParse(stringValue, out var guid))
            {
                return await ResolveGuidAsync(guid, key);
            }

            return stringValue;
        }
        private async Task<string> FormatChangesFieldAsync(string changesJson)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(changesJson))
                    return "No changes";

                var changes = JsonConvert.DeserializeObject<Dictionary<string, object>>(changesJson);
                var result = new StringBuilder();

                foreach (var change in changes)
                {
                    var formattedValue = await FormatChangeValueAsync(change.Key, change.Value);
                    result.AppendLine($"{FormatPropertyName(change.Key)}: {formattedValue}");
                }

                return result.ToString().TrimEnd();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error formatting changes: {ex.Message}");
                return changesJson.Length > 100 ? changesJson.Substring(0, 97) + "..." : changesJson;
            }
        }
        private async Task<string> ResolveGuidAsync(Guid guid, string context = null)
        {
            try
            {
                // Try to resolve as Technician (either by ID or UserID)
                var technician = await _technicianService.GetTechnicianByIdAsync(guid)
                              ?? (context != "UserId" ? await _technicianService.GetTechnicianByIdAsync(guid) : null);
                if (technician != null) return $"TECH: {technician.Name}";

                // Try to resolve as Client (either by ID or UserID)
                var client = await _clientService.GetClientByIdAsync(guid)
                           ?? (context != "UserId" ? await _clientService.GetClientByIdAsync(guid) : null);
                if (client != null) return $"CLIENT: {client.Name}";

                // Try to resolve as User
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
            catch (Exception ex)
            {
                Console.WriteLine($"Error resolving GUID {guid}: {ex.Message}");
                return guid.ToString();
            }
        }

        // Then remove ResolveUserWithRoleAsync completely

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

            return TruncateLongText(value);
        }

        private string TruncateLongText(string value, int maxLength = 100)
        {
            if (string.IsNullOrEmpty(value)) return value;
            return value.Length > maxLength ? value.Substring(0, maxLength - 3) + "..." : value;
        }

        private bool IsGuidProperty(string propertyName)
        {
            return propertyName.EndsWith("Id", StringComparison.OrdinalIgnoreCase) ||
                   propertyName.Equals("UserId", StringComparison.OrdinalIgnoreCase) ||
                   propertyName.Equals("EntityId", StringComparison.OrdinalIgnoreCase);
        }
        private string FormatStatusValue(string statusValue)
        {
            if (int.TryParse(statusValue, out var statusInt) &&
                Enum.IsDefined(typeof(InterventionStatus), statusInt))
            {
                return ((InterventionStatus)statusInt).ToString();
            }
            return statusValue;
        }

       
        private async Task<List<ProcessedDataItem>> ProcessDataAsync<T>(IEnumerable<T> data)
        {
            var processedData = new List<ProcessedDataItem>();
            var properties = typeof(T).GetProperties();

            foreach (var item in data)
            {
                var processedItem = new ProcessedDataItem();
                foreach (var prop in properties)
                {
                    var value = prop.GetValue(item)?.ToString() ?? "-";
                    var formattedValue = await FormatCellValueAsync(value, prop.PropertyType, prop.Name);
                    processedItem.Properties.Add(new ProcessedProperty
                    {
                        Name = prop.Name,
                        Value = formattedValue
                    });
                }
                processedData.Add(processedItem);
            }

            return processedData;
        }

        private class ProcessedDataItem
        {
            public List<ProcessedProperty> Properties { get; set; } = new List<ProcessedProperty>();
        }

        private class ProcessedProperty
        {
            public string Name { get; set; }
            public string Value { get; set; }
        }
    }
}