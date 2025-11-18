import React from "react";
import { BsChevronLeft } from "react-icons/bs";
import { useAuthProvider } from "../../context/Auth";
import { getNotifications } from "../../services/notification.service";
import { getCookie } from "../../services/cookie.service";
import { INotification, notificationsMock } from "../../interfaces/notification";


interface INotificationProps {
  open: boolean;
  close: () => void;
}

export function Notification({ open, close }: INotificationProps) {
  const [notifications, setNotifications] = React.useState<INotification[]>([])
  const token = getCookie("token");
  const { currentUser } = useAuthProvider();

  React.useEffect(() => {
    (async () => {
      if (token) {
        const resp = await getNotifications();
        setNotifications(resp.data);
      }
    })();
  }, [token]);

  if (!currentUser) return null;

  return (
    <aside
      className={`
        fixed z-10 inset-0 top-0 left-0 w-screen h-screen
        flex justify-end transition-all
        ${open ? "visible bg-gray-100/30 backdrop-blur-sm" : "invisible"}
      `}
      onClick={close}
    >
      <div
        className={`
          h-full overflow-hidden flex flex-col
          w-full sm:w-[375px] p-4 transition ease 
          duration-[0.4s] bg-white relative
          ${open ? "translate-x-0" : "translate-x-full"}
        `}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative flex justify-center items-center min-h-20">
          <BsChevronLeft
            className="absolute left-0 top-1/2 -translate-y-1/2 text-lg cursor-pointer"
            onClick={close}
          />
          <h2 className="text-lg font-semibold">Notificações</h2>
        </div>

        <div className="overflow-y-auto my-2 mb-14 not-scroll-bar">
          <ul className="flex flex-col gap-2">
            <ul className="flex flex-col gap-2">
              {notifications.length === 0 ? (
  <li className="text-center text-gray-500 text-sm py-4">
    Sem notificações
  </li>
              ) : (
                notifications.map((n) => (
                  <li
                    key={n.id}
                    className="p-3 rounded-md border border-gray-200 shadow-sm flex flex-col"
                  >
                    <span className="text-sm font-semibold">{n.type}</span>
                    <span className="text-gray-700 text-sm">{n.message}</span>
                    <span className="text-xs text-gray-500 mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </li>
                ))
              )}

            </ul>
          </ul>
        </div>
      </div>
    </aside>
  );
}
