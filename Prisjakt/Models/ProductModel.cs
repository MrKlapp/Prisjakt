using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Prisjakt.Models
{
	public class ProductModel
	{
		public string Url { get; set; }
		public int Id { get; set; }
		public int Price { get; set; }
		public int PriceDrop { get; set; }
		public string ImageUrl { get; set; }
		public string Name { get; set; }
		public string Category { get; set; }
        public bool IsNew { get; set; }
        public DateTime LastUpdated { get; set; }
	}
}