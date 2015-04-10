using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using SharedEditorsExample.Models;

namespace SharedEditorsExample.Code
{
    public class CustomFieldManager
    {
        public List<CustomField> GetCustomFields()
        {
            var customFields = new List<CustomField>()
            {
                new CustomField() { FieldName = "Student_ID", FriendlyName = "Student ID" },
                new CustomField() { FieldName = "First_Name", FriendlyName = "First Name" },
                new CustomField() { FieldName = "Phone", FriendlyName = "Phone" },
                new CustomField() { FieldName = "Email", FriendlyName = "Email" },
                new CustomField() { FieldName = "Student_ID2", FriendlyName = "Student ID2" },
                new CustomField() { FieldName = "First_Name2", FriendlyName = "First Name2" },
                new CustomField() { FieldName = "Phone2", FriendlyName = "Phone2" },
                new CustomField() { FieldName = "Email2", FriendlyName = "Email2" },
            };
            return customFields;
        }
    }
}