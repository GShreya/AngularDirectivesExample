using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using SharedEditorsExample.Models;

namespace SharedEditorsExample.Code
{
    public class FileManager
    {
        private Dictionary<int, UserFile> _files;

        public FileManager()
        {
            _files = new Dictionary<int, UserFile>();
            _files.Add(1, new UserFile() { FileName = "File01", FileGroup = "voice", BinaryData = System.Text.Encoding.UTF8.GetBytes("This is some text A") });
            _files.Add(2, new UserFile() { FileName = "File02", FileGroup = "email", BinaryData = System.Text.Encoding.UTF8.GetBytes("This is some text B") });
            _files.Add(3, new UserFile() { FileName = "File03", FileGroup = "sms", BinaryData = System.Text.Encoding.UTF8.GetBytes("This is some text C") });
            _files.Add(4, new UserFile() { FileName = "File04", FileGroup = "shared", BinaryData = System.Text.Encoding.UTF8.GetBytes("This is some text D") });
            _files.Add(5, new UserFile() { FileName = "File05", FileGroup = "email", BinaryData = System.Text.Encoding.UTF8.GetBytes("This is some text E") });
        }

        public List<UserFileItem> GetListOfFiles(List<string> fileGroups)
        {
            IEnumerable<KeyValuePair<int, UserFile>> specifiedFiles;
            if (fileGroups == null || fileGroups.Count == 0)
            {
                specifiedFiles = _files;
            }
            else
            {
                specifiedFiles = _files.Where(f => fileGroups.Any(g => f.Value.FileGroup == g)).ToList();
            }
            var items = specifiedFiles.Select(file =>
                new UserFileItem()
                {
                    ID = file.Key,
                    FileName = file.Value.FileName
                }).ToList();
            return items;
        }

        public UserFile GetFile(int fileID)
        {
            if (_files.ContainsKey(fileID))
            {
                return _files[fileID];
            }
            
            throw new ArgumentOutOfRangeException("No file with ID: " + fileID);
        }
    }
}