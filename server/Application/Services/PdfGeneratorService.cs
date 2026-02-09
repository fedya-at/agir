using Domain.Entities;
using Domain.Enums;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Application.Services
{
    public interface IPdfGeneratorService
    {
        byte[] GenerateInvoicePdf(Invoice invoice, Intervention intervention);
    }

    public class PdfGeneratorService : IPdfGeneratorService
    {
        public byte[] GenerateInvoicePdf(Invoice invoice, Intervention intervention)
        {
            QuestPDF.Settings.License = LicenseType.Community;

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(10).FontFamily("Arial"));

                    page.Header()
                        .Row(header =>
                        {
                            header.RelativeItem().AlignRight().Column(col =>
                            {
                                col.Item().AlignRight().Text("FACTURE")
                                    .FontSize(20).Bold().FontColor(Colors.Black);
                                col.Item().PaddingTop(6).AlignRight().Text($"N° de facture : {invoice.InvoiceNumber}")
                                    .FontSize(10).FontColor(Colors.Grey.Darken2);
                                col.Item().AlignRight().Text($"{invoice.IssueDate:dd MMMM yyyy}")
                                    .FontSize(10).FontColor(Colors.Grey.Darken2);
                            });
                        });

                    page.Content()
                        .PaddingVertical(1.0f, Unit.Centimetre)
                        .Column(column =>
                        {
                            column.Spacing(15);

                            // Bill To and Company Info Section
                            column.Item().Row(row =>
                            {
                                // Bill To Section
                                row.RelativeItem().Column(col =>
                                {
                                    col.Item().Text("FACTURÉ À :").Bold().FontSize(9).FontColor(Colors.Grey.Darken1);
                                    col.Item().PaddingTop(5).Text($"{intervention.Client?.Name ?? "Client inconnu"}")
                                        .FontSize(10).Bold();
                                    col.Item().Text($"ID Client : {intervention.ClientId}")
                                        .FontSize(9).FontColor(Colors.Grey.Darken2);
                                    col.Item().Text($"Date d'intervention : {intervention.StartDate:dd/MM/yyyy}")
                                        .FontSize(9).FontColor(Colors.Grey.Darken2);
                                    if (intervention.EndDate.HasValue)
                                    {
                                        col.Item().Text($"Terminée : {intervention.EndDate.Value:dd/MM/yyyy}")
                                            .FontSize(9).FontColor(Colors.Grey.Darken2);
                                    }
                                });

                                // Company Info Section (Right side)
                                row.RelativeItem().AlignRight().Column(col =>
                                {
                                    col.Item().AlignRight().Text("Lab-IT")
                                        .FontSize(12).Bold();
                                    col.Item().AlignRight().Text("Rue des Catacombes, Cité Ezzahra, Sousse")
                                        .FontSize(9).FontColor(Colors.Grey.Darken2);
                                    col.Item().AlignRight().Text("+216 50 23 49 11")
                                        .FontSize(9).FontColor(Colors.Grey.Darken2);
                                    if (intervention.TechnicianId.HasValue)
                                    {
                                        col.Item().PaddingTop(3).AlignRight().Text($"Technicien : {intervention.Technician?.Name ?? "Inconnu"}")
                                            .FontSize(9).FontColor(Colors.Grey.Darken2);
                                    }
                                });
                            });

                            // Horizontal line separator
                            column.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten2);

                            // Parts/Items Table
                            if (intervention.InterventionParts.Any() && intervention.InterventionParts.First().Part != null)
                            {
                                column.Item().Table(table =>
                                {
                                    // Define columns with better proportions
                                    table.ColumnsDefinition(columns =>
                                    {
                                        columns.RelativeColumn(3);   // Item description (wider)
                                        columns.ConstantColumn(60);  // Quantity
                                        columns.ConstantColumn(70); // Unit Price
                                        columns.ConstantColumn(70); // Total
                                    });

                                    // Enhanced header with background
                                    table.Header(header =>
                                    {
                                        header.Cell().Element(CellStyle).Text("Article").Bold().FontSize(9);
                                        header.Cell().Element(CellStyle).AlignCenter().Text("Quantité").Bold().FontSize(9);
                                        header.Cell().Element(CellStyle).AlignCenter().Text("Prix Unitaire (DT)").Bold().FontSize(9);
                                        header.Cell().Element(CellStyle).AlignRight().Text("Total (DT)").Bold().FontSize(9);

                                        static IContainer CellStyle(IContainer container)
                                        {
                                            return container
                                                .Background(Colors.Grey.Lighten3)
                                                .Padding(6)
                                                .BorderBottom(1)
                                                .BorderColor(Colors.Grey.Lighten1);
                                        }
                                    });

                                    // Add data rows with alternating background
                                    bool isEvenRow = false;
                                    foreach (var part in intervention.InterventionParts)
                                    {
                                        var bgColor = isEvenRow ? Colors.White : Colors.Grey.Lighten4;

                                        table.Cell().Element(container => CellStyle(container, bgColor))
                                            .Text($"{part.Part.Description}").FontSize(9);
                                        table.Cell().Element(container => CellStyle(container, bgColor))
                                            .AlignCenter().Text(part.Quantity.ToString()).FontSize(9);
                                        table.Cell().Element(container => CellStyle(container, bgColor))
                                            .AlignCenter().Text($"{part.Part.Price:F3} DT").FontSize(9);
                                        table.Cell().Element(container => CellStyle(container, bgColor))
                                            .AlignRight().Text($"{part.GetTotalPrice():F3} DT").FontSize(9);

                                        isEvenRow = !isEvenRow;
                                    }

                                    static IContainer CellStyle(IContainer container, string backgroundColor)
                                    {
                                        return container
                                            .Background(backgroundColor)
                                            .Padding(6)
                                            .BorderBottom(0.5f)
                                            .BorderColor(Colors.Grey.Lighten2);
                                    }
                                });
                            }
                            else if (intervention.InterventionParts.Any())
                            {
                                column.Item().Background(Colors.Grey.Lighten4).Padding(10)
                                    .Text($"Pièces utilisées : {intervention.InterventionParts.Count} (détails non chargés)")
                                    .FontSize(9).Italic();
                            }

                            // Summary Section with enhanced styling
                            column.Item().PaddingTop(10).AlignRight().Column(summaryCol =>
                            {
                                summaryCol.Item().Width(140).Column(col =>
                                {
                                    // Labor Cost
                                    col.Item().Row(row =>
                                    {
                                        row.RelativeItem().Text("Main d'œuvre :").FontSize(9);
                                        row.ConstantItem(60).AlignRight().Text($"{invoice.LaborCost:F3} DT").FontSize(9);
                                    });

                                    // Parts Cost
                                    col.Item().PaddingTop(3).Row(row =>
                                    {
                                        row.RelativeItem().Text("Pièces :").FontSize(9);
                                        row.ConstantItem(60).AlignRight().Text($"{invoice.TotalPartsCost:F3} DT").FontSize(9);
                                    });

                                    // Subtotal
                                    col.Item().PaddingTop(3).Row(row =>
                                    {
                                        row.RelativeItem().Text("Sous-total :").FontSize(9).Bold();
                                        row.ConstantItem(60).AlignRight().Text($"{invoice.TotalAmount:F3} DT").FontSize(9).Bold();
                                    });

                                    // Tax (assuming 0% for now)
                                    col.Item().PaddingTop(3).Row(row =>
                                    {
                                        row.RelativeItem().Text("TVA (0%) :").FontSize(9);
                                        row.ConstantItem(60).AlignRight().Text("0 DT").FontSize(9);
                                    });

                                    // Separator line
                                    col.Item().PaddingTop(6).LineHorizontal(1).LineColor(Colors.Grey.Darken1);

                                    // Total Due - Enhanced
                                    col.Item().PaddingTop(6).Background(Colors.Grey.Lighten4).Padding(6).Row(row =>
                                    {
                                        row.RelativeItem().Text("Total à payer").FontSize(11).Bold();
                                        row.ConstantItem(60).AlignRight().Text($"{invoice.TotalAmount:F3} DT").FontSize(11).Bold();
                                    });
                                });
                            });

                            // Payment Status with enhanced styling
                            if (invoice.Status == InvoiceStatus.Paid)
                            {
                                column.Item().PaddingTop(10).AlignCenter()
                                    .Background(Colors.Green.Lighten4).Padding(8)
                                    .Text("PAYÉE").Bold().FontColor(Colors.Green.Darken3).FontSize(12);
                            }
                            else if (DateTime.Now > invoice.DueDate && invoice.Status != InvoiceStatus.Paid)
                            {
                                column.Item().PaddingTop(10).AlignCenter()
                                    .Background(Colors.Red.Lighten4).Padding(8)
                                    .Text("EN RETARD").Bold().FontColor(Colors.Red.Darken3).FontSize(12);
                            }

                            // Thank you message
                            column.Item().PaddingTop(15).Text("Merci pour votre confiance !")
                                .FontSize(11).Bold().FontColor(Colors.Grey.Darken2);

                            // Payment Information Section
                            column.Item().PaddingTop(10).Row(row =>
                            {
                                row.RelativeItem().Column(col =>
                                {
                                    col.Item().Text("INFORMATIONS DE PAIEMENT").Bold().FontSize(9).FontColor(Colors.Grey.Darken1);
                                    col.Item().PaddingTop(5).Text("Lab-IT").FontSize(9);
                                    col.Item().Text("Nom du compte : Inconnu").FontSize(9);
                                    col.Item().Text("N° de compte : 987-654-321").FontSize(9);
                                });

                                row.RelativeItem().AlignRight().Column(col =>
                                {
                                    col.Item().AlignRight().Text("Lab-IT").FontSize(10).Bold();
                                    col.Item().AlignRight().Text("Rue des Catacombes, Cité Ezzahra, Sousse")
                                        .FontSize(9).FontColor(Colors.Grey.Darken2);
                                });
                            });
                        });

                    page.Footer()
                        .AlignCenter()
                        .Text(x =>
                        {
                            x.Span("Page ");
                            x.CurrentPageNumber();
                        });
                });
            });

            return document.GeneratePdf();
        }
    }
}