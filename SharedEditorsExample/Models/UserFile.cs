using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SharedEditorsExample.Models
{
    public class UserFile
    {
        public string FileGroup { get; set; }
        public string FileName { get; set; }
        public byte[] BinaryData { get; set; }
    }
}