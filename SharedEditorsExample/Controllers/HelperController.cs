using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;
using System.Web.Razor.Generator;
using SharedEditorsExample.Code;

namespace SharedEditorsExample.Controllers
{
    public class HelperController : Controller
    {
        public ActionResult GetRootURL()
        {
            var rootUrl = Url.Action("Index", "Home");
            return Json(rootUrl, JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetDirectiveTemplates()
        {
            var path = Server.MapPath(Url.Content("~/Content/DirectiveTemplates"));
            var templateFile = new DirectiveTemplatesGenerator().GetDirectiveTemplatesFile("as.templates", path);
            return JavaScript(templateFile);
        }
    }
}