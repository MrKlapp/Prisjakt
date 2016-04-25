using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Caching;
using System.Web.Http;

namespace Prisjakt.Controllers
{
    public class CacheController : ApiController
    {
        private readonly Cache _cache;

        public CacheController(Cache cache)
        {
            _cache = cache;
        }

        public CacheController()
            : this(HttpRuntime.Cache)
        {

        }

        public void Put(string key, object obj, TimeSpan expireNext)
        {
            if (key == null || obj == null)
                return;
            _cache.Insert(key, obj, null, DateTime.Now.Add(expireNext), TimeSpan.Zero);
        }

        public object Get(string key)
        {
            return _cache.Get(key);
        }

    }
}
