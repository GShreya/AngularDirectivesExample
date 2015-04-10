using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using SharedEditorsExample.Code;
using SharedEditorsExample.Models;

namespace SharedEditorsExample.Controllers
{
    public class FileController : Controller
    {
        private FileManager _fileManager;
        private CustomFieldManager _customFieldManager;
        public FileController()
        {
            _fileManager = new FileManager();
            _customFieldManager = new CustomFieldManager();
        }

        // GET: File
        public ActionResult Index()
        {
            return View();
        }
        
        // naming-wise:
        // custom fields become mergefields
        // files become messagetemplates

        public ActionResult GetMergeFields()
        {
            var customFields = _customFieldManager.GetCustomFields();
            var mergeFields = customFields.Select(customField => customField.FieldName).ToList();
            return Json(mergeFields, JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetListOfMessageTemplates(List<string> fileGroups)
        {
            var files = _fileManager.GetListOfFiles(fileGroups);
            var messageTemplates = files.Select(file =>
                new MessageTemplateItemVm()
                {
                    MessageTemplateID = file.ID,
                    MessageTemplateName = file.FileName
                }).ToList();
            return Json(messageTemplates, JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetMessageTemplateData(int messageTemplateID)
        {
            var file = _fileManager.GetFile(messageTemplateID);
            var templateVm = new MessageTemplateVm()
            {
                MessageTemplateName = file.FileName,
                MessageTemplateData = Convert.ToBase64String(file.BinaryData),
            };
            return Json(templateVm, JsonRequestBehavior.AllowGet);
        }
    }
}