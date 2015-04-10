using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace SharedEditorsExample.Controllers
{
    public class PageController : Controller
    {
        public ActionResult SPA1()
        {
            return View();
        }
        public ActionResult SPA2()
        {
            return View();
        }
        public ActionResult SPA3()
        {
            return View();
        }
    }
}