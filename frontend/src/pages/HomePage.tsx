import ChatContainer from "../components/ChatContainer";
import NoChatSelected from "../components/NoChatSelected";
import Sidebar from "../components/Sidebar";
import { useChatStore } from "../store/useChatStore";
import { useMediaQuery } from "../lib/hooks";

const HomePage = () => {
  const { selectedUser } = useChatStore();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const mobileView = selectedUser ? <ChatContainer /> : <Sidebar />;

  const desktopView = (
    <>
      <Sidebar />
      {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
    </>
  );

  return (
    <div className="lg:h-screen h-fit bg-base-300/40">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-6xl lg:h-[calc(100vh-8rem)] h-[calc(100vh-11rem)]">
          <div className="flex h-full overflow-hidden">
            {isMobile ? mobileView : desktopView}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
