using System.Web.Mvc;
using System.Web.Routing;
using FluentScheduler;
using Prisjakt.Controllers;

namespace Prisjakt
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            RouteConfig.RegisterRoutes(RouteTable.Routes);

			JobManager.Initialize(new ScheduleController());
		}
    }
}
