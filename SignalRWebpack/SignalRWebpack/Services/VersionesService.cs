namespace SignalRWebpack.Services;

public class VersionesService
{
    private Versiones _versiones;

    public VersionesService()
    {
        _versiones = new Versiones
        {
            Admision = "v1",
            Citas = "v2"
        };
    }

    public Versiones GetVersiones()
    {
        return _versiones;
    }

    public void UpdateAdmisionVersion(string version)
    {
        _versiones.Admision = version;
    }

    public void UpdateCitasVersion(string version)
    {
        _versiones.Citas = version;
    }
}

public class Versiones
{
    public string Admision { get; set; } = "v1";
    public string Citas { get; set; } = "v2";
} 