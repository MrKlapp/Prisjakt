using System;
using System.Collections.Generic;
using System.Configuration;
using System.Web.Mvc;
using Prisjakt.Models;

namespace Prisjakt.Controllers
{
	public class HomeController : Controller
	{
		public ActionResult Index()
		{
			var link = ConfigurationManager.AppSettings["urlBestPrices"];
            var products = GetProducts(link, true);

			return View((List<ProductModel>)products);
		}
        
	    public List<ProductModel> GetProducts(string link, bool useCache)
	    {
            var scrapeController = new ScrapeController();
            var filteredProducts = scrapeController.GetFilteredProducts(link, true);
	        return filteredProducts;
	    }


    }
}