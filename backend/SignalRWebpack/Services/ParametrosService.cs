namespace SignalRWebpack.Services;

public class ParametrosService
{
    private Parametros _parametros;

    public ParametrosService()
    {
        _parametros = new Parametros
        {
            UsaParametro1 = "1",
            UsaParametro2 = "1",
            UsaParametro3 = "1"
        };
    }

    public Parametros GetParametros()
    {
        return _parametros;
    }

    public void UpdatePrametro1(string valor)
    {
        _parametros.UsaParametro1 = valor;
    }
    public void UpdatePrametro2(string valor)
    {
        _parametros.UsaParametro2 = valor;
    }
    public void UpdatePrametro3(string valor)
    {
        _parametros.UsaParametro3 = valor;
    }
}
public class Parametros
{
    public string UsaParametro1 { get; set; } = "1";
    public string UsaParametro2 { get; set; } = "1";
    public string UsaParametro3 { get; set; } = "1";
} 
