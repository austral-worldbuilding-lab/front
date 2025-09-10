import { Button } from "@/components/ui/button";
import useMyInvitations from "@/hooks/useMyInvitations";

const MyInvitationsPage = () => {
  const { invitations, loading, error, accept, reject, actionLoadingId, page, setPage, totalPages } = useMyInvitations();

  if (loading) {
    return <div className="p-4">Cargando invitaciones...</div>;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <h1 className="text-xl font-semibold">Mis invitaciones</h1>
      {error && <div className="text-red-600">{error}</div>}
      {invitations.length === 0 ? (
        <div className="text-muted-foreground">No tenés invitaciones pendientes.</div>
      ) : (
        <>
          <ul className="space-y-3">
            {invitations.map((inv) => (
              <li
                key={inv.id}
                className="border rounded-md p-3 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">
                    {inv.projectName ?? "Proyecto"}
                  </div>
                  {inv.invitedBy && (
                    <div className="text-sm text-muted-foreground">
                      Invitado por {inv.invitedBy}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => accept(inv.id)}
                    disabled={actionLoadingId === inv.id}
                  >
                    Aceptar
                  </Button>
                  <Button
                    variant="outline"
                    color="secondary"
                    onClick={() => reject(inv.id)}
                    disabled={actionLoadingId === inv.id}
                  >
                    Rechazar
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                color="tertiary"
                disabled={page <= 1}
                onClick={() => setPage(Math.max(1, page - 1))}
              >
                Anterior
              </Button>
              <div className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </div>
              <Button
                variant="outline"
                color="tertiary"
                disabled={page >= totalPages}
                onClick={() => setPage(Math.min(totalPages, page + 1))}
              >
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyInvitationsPage; 