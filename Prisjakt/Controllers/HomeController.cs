using System;
using System.Collections.Generic;
using System.Configuration;
using System.Web.Mvc;
using Prisjakt.Models;

namespace Prisjakt.Controllers
{
	public class HomeController : Controller
	{
		readonly string _link = ConfigurationManager.AppSettings["urlBestPrices"];
		public ActionResult Index()
		{
            var products = GetProducts(_link);

			return View((List<ProductModel>)products);
		}
        
	    private List<ProductModel> GetProducts(string link)
	    {
            var scrapeController = new ScrapeController();
            var filteredProducts = scrapeController.GetFilteredProducts(link, true, false);
	        return filteredProducts;
	    }

		public JsonResult GetProducts()
		{
			var link = ConfigurationManager.AppSettings["urlBestPrices"];
			var scrapeController = new ScrapeController();
			var filteredProducts = scrapeController.GetFilteredProducts(link, true, false);
			return Json(filteredProducts, JsonRequestBehavior.AllowGet);
		}


	}
}