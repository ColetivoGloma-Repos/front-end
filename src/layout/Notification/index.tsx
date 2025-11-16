import React from "react";
import { BsChevronLeft } from "react-icons/bs";
import { useAuthProvider } from "../../context/Auth";
import { getNotifications } from "../../services/notification.service";
import { getCookie } from "../../services/cookie.service";
import { INotification } from "../../interfaces/notification";


interface INotificationProps {
  open: boolean;
  close: () => void;
}

export function   Notification({ open, close }: INotificationProps) {
  const [notifications, setNotifications] = React.useState<INotification[]>([])
  const token = getCookie("token");
  const { currentUser } = useAuthProvider();
    React.useEffect(() => {
      (async () => {
        if (token) {
          const resp = await getNotifications({ headers: { Authorization: token } });
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
         
        </div>

        <div className="overflow-y-auto my-2 mb-14 not-scroll-bar">
          <ul
            className={`
              flex flex-col gap-2
            `}
          >
            {notifications.map((n) => n.message)}        
          </ul>
        </div>   
      </div>

 
    </aside>
  );
}
