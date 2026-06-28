import { useGetNotifications, getGetNotificationsQueryKey, useMarkNotificationRead } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, Check, Info, Gift, Trophy } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";

export default function Notifications() {
  const { data } = useGetNotifications({ limit: 50 }, { query: { queryKey: getGetNotificationsQueryKey({ limit: 50 }) } });
  const markRead = useMarkNotificationRead();
  const queryClient = useQueryClient();

  const handleMarkAllRead = async () => {
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
      case 'PROMO': return <Gift className="text-amber-400" />;
      case 'WIN':   return <Trophy className="text-yellow-400" />;
      default:      return <Info className="text-blue-400" />;
    }
  };

  return (
    <div className="flex flex-col w-full pb-20" style={{ background: "#071C12", minHeight: "100%" }}>
      {data?.unreadCount ? (
        <div className="px-4 pt-3 pb-1 flex justify-end">
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl"
            style={{ background: "rgba(15,138,95,0.15)", color: "#0F8A5F", border: "1px solid rgba(15,138,95,0.30)" }}>
            <Check className="w-3.5 h-3.5" /> Tout marquer comme lu
          </motion.button>
        </div>
      ) : null}

      <div className="p-4 space-y-3">
        {data?.notifications?.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl flex gap-3 cursor-pointer"
            style={{
              background: !notif.isRead ? "rgba(15,138,95,0.12)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${!notif.isRead ? "rgba(15,138,95,0.30)" : "rgba(255,255,255,0.08)"}`,
            }}
            onClick={() => !notif.isRead && handleRead(notif.id)}
          >
            <div className="mt-1">{getIcon(notif.type)}</div>
            <div className="flex-1">
              <div className="flex justify-between items-start gap-2">
                <h3 className={`font-bold text-sm ${!notif.isRead ? "text-white" : "text-white/55"}`}>{notif.title}</h3>
                <span className="text-[10px] flex-shrink-0" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {format(new Date(notif.createdAt), "d MMM", { locale: fr })}
                </span>
              </div>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{notif.message}</p>
            </div>
            {!notif.isRead && <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: "#0F8A5F" }} />}
          </motion.div>
        ))}
        {(!data?.notifications || data.notifications.length === 0) && (
          <div className="text-center p-12">
            <Bell className="w-12 h-12 mx-auto mb-3" style={{ color: "rgba(255,255,255,0.15)" }} />
            <p style={{ color: "rgba(255,255,255,0.40)" }}>Aucune notification</p>
          </div>
        )}
      </div>
    </div>
  );
}
