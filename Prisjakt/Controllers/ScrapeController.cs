using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Http;
using Prisjakt.Models;
using HtmlDocument = HtmlAgilityPack.HtmlDocument;

namespace Prisjakt.Controllers
{
    public class ScrapeController : ApiController
    {
        private readonly CacheController _cache = new CacheController();
        public List<ProductModel> GetFilteredProducts(string link, bool useCache)
        {
            const string cacheKey = "getFilteredProducts";
            var cachedObj = _cache.Get(cacheKey);
            if (cachedObj != null && useCache)
            {
                return (List<ProductModel>)cachedObj;
            }

            var products = ScanProducts(link);

            var filteredProducts = new List<ProductModel>();
            foreach (var product in products.Where(a => a.PriceDrop < -50))
            {
                product.IsNew = false;
                var isProductAvailable = IsProductInStock(product);

                bool isNewProduct = filteredProducts.Where(a => a.Id != product.Id).ToArray().Any();
                if (isProductAvailable != null && isNewProduct)
                {
                    product.IsNew = true;
                }

                if (isProductAvailable != null)
                    filteredProducts.Add(product);

            }
            _cache.Put(cacheKey, filteredProducts, new TimeSpan(1, 0, 0));
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
