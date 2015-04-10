using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(SharedEditorsExample.Startup))]
namespace SharedEditorsExample
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
