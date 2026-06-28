import { useGetNotifications, getGetNotificationsQueryKey, useMarkNotificationRead } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, Check, Info, Gift, Trophy } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function Notifications() {
  const { data } = useGetNotifications({ limit: 50 }, { query: { queryKey: getGetNotificationsQueryKey({ limit: 50 }) } });
  const markRead = useMarkNotificationRead();
  const queryClient = useQueryClient();

  const handleMarkAllRead = async () => {
    // Ideally an endpoint to mark all, here we just refetch for UI logic or mock it
    queryClient.invalidateQueries({ queryKey: getGetNotificationsQueryKey({ limit: 50 }) });
  };

  const handleRead = async (id: number) => {
    try {
      await markRead.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getGetNotificationsQueryKey({ limit: 50 }) });
    } catch(e) {}
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'PROMO': return <Gift className="text-amber-500" />;
      case 'WIN': return <Trophy className="text-yellow-500" />;
      default: return <Info className="text-blue-500" />;
    }
  };

  return (
    <div className="flex flex-col w-full pb-20" style={{ background: "#EAF8F2", minHeight: "100%" }}>
      {data?.unreadCount ? (
        <div className="px-4 pt-3 pb-1 flex justify-end">
          <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="text-xs">
            <Check className="w-4 h-4 mr-1"/> Tout marquer comme lu
          </Button>
        </div>
      ) : null}

      <div className="p-4 space-y-3">
        {data?.notifications?.map((notif) => (
          <div 
            key={notif.id} 
            className={`p-4 rounded-xl border flex gap-3 ${!notif.isRead ? 'bg-primary/5 border-primary/20' : 'bg-card border-border'}`}
            onClick={() => !notif.isRead && handleRead(notif.id)}
          >
            <div className="mt-1">{getIcon(notif.type)}</div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className={`font-bold text-sm ${!notif.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>{notif.title}</h3>
                <span className="text-[10px] text-muted-foreground">{format(new Date(notif.createdAt), "d MMM", { locale: fr })}</span>
              </div>
              <p className="text-xs mt-1 text-muted-foreground leading-relaxed">{notif.message}</p>
            </div>
            {!notif.isRead && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
          </div>
        ))}
        {(!data?.notifications || data.notifications.length === 0) && (
          <div className="text-center p-12 text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Aucune notification</p>
          </div>
        )}
      </div>
    </div>
  );
}
