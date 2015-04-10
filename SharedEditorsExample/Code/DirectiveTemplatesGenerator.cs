using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using Microsoft.Ajax.Utilities;

namespace SharedEditorsExample.Code
{
    public class DirectiveTemplatesGenerator
    {
        public string GetDirectiveTemplatesFile(string moduleName, string path)
        {
            var files = GetFiles(path);
            return GenerateDirectiveTemplateFile(moduleName, files);
        }

        public Dictionary<string, string> GetFiles(string path)
        {
            var templateFiles = new Dictionary<string, string>();
            if (Directory.Exists(path))
            {
                var fullrootpath = Path.GetFullPath(path);
                FileInfo[] files = null;
                var folder = new DirectoryInfo(path);
                files = folder.GetFiles("*.html", SearchOption.AllDirectories);
                var fulltemplatePaths = files.Select(file => file.FullName).ToArray();
                foreach (var fullpath in fulltemplatePaths)
                {
                    // only want the segment of the path after the root folder
                    var endingpath = fullpath.Replace(fullrootpath, "").ToLower();
                    if (endingpath.StartsWith("\\"))
                    {
                        endingpath = endingpath.Substring(1, endingpath.Length - 1);
                    }
                    endingpath = endingpath.Replace("\\", "/"); // flip slashes
                    var content = File.ReadAllText(fullpath);
                    templateFiles.Add(endingpath, content);
                }
            }
            return templateFiles;
        }

        public string GenerateDirectiveTemplateFile(string moduleName, Dictionary<string, string> files)
        {
            var moduleRegistration = new StringBuilder();
            moduleRegistration.AppendLine("angular.module(\""+moduleName+"\", [");
            var modules = new StringBuilder();

            foreach (var file in files)
            {
                moduleRegistration.AppendLine("\"" + file.Key + "\",");
                modules.AppendLine(GenerateDirectiveTemplateModule(file.Key, file.Value));
                modules.AppendLine("");
            }

            moduleRegistration.AppendLine("]);");
            return moduleRegistration + "\r\n" + modules;
        }

        public string GenerateDirectiveTemplateModule(string filepath, string content)
        {
            content = FormatHtmlAsJavascriptString(content);
            var sb = new StringBuilder();
            sb.Append("angular.module(\"");
            sb.Append(filepath);
            sb.Append("\", []).run([\"$templateCache\",function ($templateCache) {\r\n");
            sb.Append("$templateCache.put(\"");
            sb.Append(filepath);
            sb.Append("\",\r\n");
            sb.Append(content);
            sb.Append(");\r\n}]);");
            return sb.ToString();
        }

        public string FormatHtmlAsJavascriptString(string text)
        {
            // escape all pre-existing quotes
            var escapedText = text.Replace("\"", "\\\"");

            // split into lines
            var lines = new List<string>();
            using (var sr = new StringReader(escapedText))
            {
                string line;
                while ((line = sr.ReadLine()) != null)
                {
                    lines.Add(line);
                }
            }

            // put explicit newlines, and wrap each line in quotes and add concatenate operators
            var formattedLines = lines.Select(line => "\"" + line + "\\n\" +\r\n");
            // add an empty pair of quotes at the end
            var formattedContent = String.Join(String.Empty, formattedLines) + "\"\"";
            return formattedContent;
        }
    }
}