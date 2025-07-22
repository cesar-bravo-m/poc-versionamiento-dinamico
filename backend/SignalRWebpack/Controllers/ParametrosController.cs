using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using SignalRWebpack.Hubs;
using SignalRWebpack.Services;
namespace SignalRWebpack.Controllers;

[ApiController]
[Route("[controller]")]
public class ParametrosController : ControllerBase
{
    private readonly ParametrosService _parametrosService;
    private readonly IHubContext<ChatHub> _hubContext;

    public ParametrosController(ParametrosService parametrosService, IHubContext<ChatHub> hubContext)
    {
        _parametrosService = parametrosService;
        _hubContext = hubContext;
    }

    [HttpGet("{nodo:int}")]
    public IActionResult GetParametros(int nodo)
    {
        var parametros = _parametrosService.GetParametros();
        return Ok(new
        {
            UsaParametro1 = parametros.UsaParametro1,
            UsaParametro2 = parametros.UsaParametro2,
            UsaParametro3 = parametros.UsaParametro3,
        });
    }

    [HttpPut]
    public async Task<IActionResult> UpdateParametros([FromBody] Parametros parametros)
    {
        _parametrosService.UpdatePrametro1(parametros.UsaParametro1);
        _parametrosService.UpdatePrametro2(parametros.UsaParametro2);
        _parametrosService.UpdatePrametro3(parametros.UsaParametro3);
        await _hubContext.Clients.All.SendAsync("parametrosCambiados", parametros);
        return Ok(parametros);
    }
}
