using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Http;
using FireSharp;
using FireSharp.Config;
using Prisjakt.Models;
using FireSharp.Interfaces;
using HtmlDocument = HtmlAgilityPack.HtmlDocument;

namespace Prisjakt.Controllers
{
	public class ScrapeController : ApiController
	{
		private readonly CacheController _cache = new CacheController();
		public List<ProductModel> GetFilteredProducts(string link, bool useCache, bool notify)
		{
			const string cacheKey = "getFilteredProducts";
			var cachedObj = _cache.Get(cacheKey);
			if (cachedObj != null && useCache)
			{
				return (List<ProductModel>)cachedObj;
			}

			IFirebaseConfig config = new FirebaseConfig
			{
				AuthSecret = "Alu07HnXdaBTn2A9HbDdqit2ZRu1WTKgrk1uSqvL",
				BasePath = "https://incandescent-fire-339.firebaseio.com/"
			};
			IFirebaseClient client = new FirebaseClient(config);
			client.Delete("Product"); //Deletes all old items, otherwise they will popup

			const string cacheKeyOldProducts = "getFilteredProductsOldList";
			var cachedObjOldList = (List<ProductModel>)_cache.Get(cacheKeyOldProducts);

			var products = ScanProducts(link);

			var filteredProducts = new List<ProductModel>();
			foreach (var product in products.Where(a => a.PriceDrop < -49))
			{
				product.IsNew = false;
				var availableProduct = IsProductInStock(product);

				if (cachedObjOldList != null)
				{
					var existsInOldList = cachedObjOldList.Any(a => a.Id == product.Id);
					if (availableProduct != null && !existsInOldList)
					{
						product.IsNew = true;
						if (notify)
							client.PushAsync("Product", new { product });
					}
				}

				if (availableProduct != null)
					filteredProducts.Add(product);

			}
			_cache.Put(cacheKey, filteredProducts, new TimeSpan(0, 15, 0));
			_cache.Put(cacheKeyOldProducts, filteredProducts, new TimeSpan(2, 0, 0));

			return filteredProducts;
		}

		public static IEnumerable<ProductModel> ScanProducts(string link)
		{
			const string host = "http://www.prisjakt.se";

			using (var wc = new WebClient())
			{
				wc.Headers["User-Agent"] = "MOZILLA/5.0 (WINDOWS NT 6.1; WOW64) APPLEWEBKIT/537.1 (KHTML, LIKE GECKO) CHROME/21.0.1180.75 SAFARI/537.1";
				var html = System.Text.Encoding.UTF8.GetString(wc.DownloadData(link));

				var products = new List<ProductModel>();
				var doc = new HtmlDocument();
				doc.LoadHtml(html);

				var items = doc.DocumentNode.SelectNodes(".//table[@id=\"table_produktlista\"]//tbody//tr");
				foreach (var node in items)
				{
					try
					{
						var product = new ProductModel
							{
								LastUpdated = DateTime.Now,
								ImageUrl = node.SelectSingleNode(".//td[@class='img-cont']//img").Attributes["src"].Value,
								Price = int.Parse(node.SelectSingleNode(".//a[@class='price']").InnerText.Replace("&nbsp;", "").Replace(":-", "")),
								Url = string.Concat(host, node.SelectSingleNode(".//a[@class='price']").Attributes["href"].Value.Replace("&nbsp;", "").Replace(":-", "")),
								Name = HttpUtility.HtmlDecode(node.SelectSingleNode(".//td[5]//a").InnerText),
								Category = HttpUtility.HtmlDecode(node.SelectSingleNode(".//td[5]//span").InnerText),
								Id = int.Parse(node.SelectSingleNode(".//a[@class='price']").Attributes["href"].Value.Replace("&nbsp;", "").Replace("/produkt.php?p=", "")),
								PriceDrop = int.Parse(node.SelectSingleNode(".//span[@class='pris-change-negative']").InnerText.Replace("&nbsp;", "").Replace("%", ""))
							};
							products.Add(product);
					}
					catch (Exception)
					{
					}
				}

				return products;
			}
		}

		public static ProductModel IsProductInStock(ProductModel product)
		{
			using (var wc = new WebClient())
			{
				wc.Headers["User-Agent"] = "MOZILLA/5.0 (WINDOWS NT 6.1; WOW64) APPLEWEBKIT/537.1 (KHTML, LIKE GECKO) CHROME/21.0.1180.75 SAFARI/537.1";
				var html = wc.DownloadString(product.Url);
				var doc = new HtmlDocument();
				doc.LoadHtml(html);

				var allStores = doc.DocumentNode.SelectNodes(".//table[@id=\"prislista\"]//tbody//tr");
				if (allStores == null || allStores.Count() < 2) return null;



				var firstStoreIsInStock = doc.DocumentNode.SelectSingleNode(".//table[@id=\"prislista\"]//tbody//tr//td[7]//span[1]");
				if (firstStoreIsInStock != null && firstStoreIsInStock.InnerHtml.Contains("icon-green"))
					return product;
				return null;
			}
		}

	}
}
