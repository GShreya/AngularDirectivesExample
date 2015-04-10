using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace SharedEditorsExample.Code
{
    [TestClass]
    public class DirectiveTemplateGeneratorTests
    {

        private string GetFilePath()
        {
            return "../Content/DirectiveTemplates";
        }

        [TestMethod]
        public void TestFileGeneration()
        {
            var gen = new DirectiveTemplatesGenerator();
            var files = gen.GetFiles(GetFilePath());
            var generatedfile = gen.GenerateDirectiveTemplateFile("as.temps", files);
        }

        [TestMethod]
        public void TestModuleGeneration()
        {
            var gen = new DirectiveTemplatesGenerator();
            var files = gen.GetFiles(GetFilePath());
            var file = files.FirstOrDefault();
            var generatedmodule = gen.GenerateDirectiveTemplateModule(file.Key, file.Value);
        }

        [TestMethod]
        public void TestJSFormatting()
        {
            var gen = new DirectiveTemplatesGenerator();
            var files = gen.GetFiles(GetFilePath());
            var file = files.FirstOrDefault();
            var formatted = gen.FormatHtmlAsJavascriptString(file.Value);
        }
    }
}