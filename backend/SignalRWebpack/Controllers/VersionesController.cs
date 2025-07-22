using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using SignalRWebpack.Hubs;
using SignalRWebpack.Services;

namespace SignalRWebpack.Controllers;

[ApiController]
[Route("[controller]")]
public class VersionesController : ControllerBase
{
    private readonly VersionesService _versionesService;
    private readonly IHubContext<ChatHub> _hubContext;

    public VersionesController(VersionesService versionesService, IHubContext<ChatHub> hubContext)
    {
        _versionesService = versionesService;
        _hubContext = hubContext;
    }

    [HttpGet("{nodo:int}")]
    public IActionResult GetVersion(int nodo)
    {
        var versiones = _versionesService.GetVersiones();
        
        return Ok(new
        {
            admision = versiones.Admision,
            citas = versiones.Citas
        });
    }

    [HttpPut]
    public async Task<IActionResult> UpdateVersiones([FromBody] Versiones versiones)
    {
        var currentVersiones = _versionesService.GetVersiones();
        var changedModules = new List<string>();

        if (currentVersiones.Admision != versiones.Admision)
        {
            changedModules.Add("admision");
        }

        if (currentVersiones.Citas != versiones.Citas)
        {
            changedModules.Add("citas");
        }

        _versionesService.UpdateAdmisionVersion(versiones.Admision);
        _versionesService.UpdateCitasVersion(versiones.Citas);

        if (changedModules.Count > 0)
        {
            await _hubContext.Clients.All.SendAsync("nuevaVersionRecibida", changedModules.ToArray());
        }

        return Ok(versiones);
    }
} 