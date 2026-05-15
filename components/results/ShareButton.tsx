"use client";

interface Props {
  companyName: string;
  scoreGlobal: number;
  lecturaPrincipal: string;
  siguientePaso: string;
  diagnosticId: string;
}

export function ShareButton({
  companyName,
  scoreGlobal,
  lecturaPrincipal,
  siguientePaso,
  diagnosticId,
}: Props) {
  function handleShare() {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ribuzz.ai";
    const pasoCortado =
      siguientePaso.length > 120
        ? siguientePaso.slice(0, 120) + "..."
        : siguientePaso;

    const texto =
      `🎯 *Diagnóstico RiBuzz — ${companyName}*\n` +
      `Score comercial: ${scoreGlobal.toFixed(1)}/5\n\n` +
      `${lecturaPrincipal}\n\n` +
      `Próximo paso: ${pasoCortado}\n\n` +
      `Ver diagnóstico completo: ${appUrl}/results?d=${diagnosticId}`;

    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank", "noreferrer");
  }

  return (
    <button
      onClick={handleShare}
      className="inline-flex h-11 items-center gap-2 rounded-full px-5 font-bold text-white transition hover:opacity-90"
      style={{ backgroundColor: "#25D366" }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-5 w-5"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.118 1.522 5.852L0 24l6.343-1.498A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.001-1.369l-.359-.213-3.716.877.908-3.617-.234-.371A9.818 9.818 0 1112 21.818z" />
      </svg>
      Compartir diagnóstico
    </button>
  );
}
