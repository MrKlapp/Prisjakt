using System.Configuration;
using System.Threading.Tasks;
using FluentScheduler;

namespace Prisjakt.Controllers
{
	public class ScheduleController : Registry
	{
		public ScheduleController()
		{
			Schedule(() =>
			{
				Task.Run(() =>
				{
					var link = ConfigurationManager.AppSettings["urlBestPrices"];
					var scrapeController = new ScrapeController();
					scrapeController.GetFilteredProducts(link, false, true);
				});
			}).ToRunNow().AndEvery(5).Minutes();
		}
	}
}