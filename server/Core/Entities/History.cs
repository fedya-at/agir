
using System.Collections.Generic;

namespace Domain.Entities
    {
        public class History : BaseEntity
        {
            // Properties
            public DateTime Timestamp { get; set; }
            public string Action { get; set; } // e.g., Created, Updated, Deleted, Paid
            public string EntityName { get; set; } // e.g., Intervention, Invoice, Client
            public Guid EntityId { get; set; } // ID of the entity that was affected
            public string Changes { get; set; } // JSON string of changes made
            public Guid UserId { get; set; } // ID of the user who performed the action

            // Constructors
            public History()
            {
                Timestamp = DateTime.UtcNow;
            }

            public History(string action, string entityName, Guid entityId, Guid userId, string changes = null)
                : this()
            {
                Action = action ?? throw new ArgumentNullException(nameof(action));
                EntityName = entityName ?? throw new ArgumentNullException(nameof(entityName));
                EntityId = entityId;
                UserId = userId;
                Changes = changes;
            }

            // Factory method for creation actions
            public static History CreateCreationRecord(string entityName, Guid entityId, Guid userId, object initialValues)
            {
                return new History(
                    action: "Created",
                    entityName: entityName,
                    entityId: entityId,
                    userId: userId,
                    changes: SerializeChanges(initialValues)
                );
            }

            // Factory method for update actions
            public static History CreateUpdateRecord(string entityName, Guid entityId, Guid userId, object oldValues, object newValues)
            {
                var changes = new Dictionary<string, object>
            {
                { "OldValues", oldValues },
                { "NewValues", newValues }
            };

                return new History(
                    action: "Updated",
                    entityName: entityName,
                    entityId: entityId,
                    userId: userId,
                    changes: SerializeChanges(changes)
                );
            }

            // Factory method for deletion actions
            public static History CreateDeletionRecord(string entityName, Guid entityId, Guid userId, object deletedValues)
            {
                return new History(
                    action: "Deleted",
                    entityName: entityName,
                    entityId: entityId,
                    userId: userId,
                    changes: SerializeChanges(deletedValues)
                );
            }

            // Helper method to serialize changes to JSON
            private static string SerializeChanges(object changes)
            {
                if (changes == null) return null;

                try
                {
                    return System.Text.Json.JsonSerializer.Serialize(changes);
                }
                catch
                {
                    // Fallback to ToString() if serialization fails
                    return changes.ToString();
                }
            }

            // Method to deserialize changes
            public T GetChanges<T>() where T : class
            {
                if (string.IsNullOrEmpty(Changes)) return default;

                try
                {
                    return System.Text.Json.JsonSerializer.Deserialize<T>(Changes);
                }
                catch
                {
                    return default;
                }
            }

            // Override ToString for better logging/debugging
            public override string ToString()
            {
                return $"[{Timestamp:yyyy-MM-dd HH:mm:ss}] {Action} {EntityName} (ID: {EntityId}) by user {UserId}";
            }
        }
    }
