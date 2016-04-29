using System;
using System.Collections.Generic;
using System.Configuration;
using System.Web.Http;
using System.Web.Mvc;
using Prisjakt.Models;

namespace Prisjakt.Controllers
{
	public class HomeController : Controller
	{
		readonly ScrapeController _scrapeController = new ScrapeController();
		readonly string _link = ConfigurationManager.AppSettings["urlBestPrices"];

		public ActionResult Index()
		{
			return View();
		}

		public JsonResult GetProducts()
		{
			var filteredProducts = _scrapeController.GetFilteredProducts(_link, true, false);
			return Json(filteredProducts, JsonRequestBehavior.AllowGet);
		}
		
		public void AddProduct(int id, string name, int price, int pricedrop, string imageUrl)
		{
			var product = new ProductModel() {Id = id, Name = name, PriceDrop = pricedrop, Price = price, ImageUrl = imageUrl, Category = "", IsNew = true, Url = "", LastUpdated = DateTime.Now};
			_scrapeController.AddProduct(product);
		}


	}
}