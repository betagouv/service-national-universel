import ResizablePanel from "./ResizablePanel";

const TicketsBottomDrawer = () => {
  return (
    <ResizablePanel className={`flex-grow-0 flex-shrink-0 border-l-2 z-10 overflow-hidden flex h-80`} position="bottom" name="admin-tickets-bottom-panel">
      <div className="relative flex flex-col overflow-hidden w-full"></div>
    </ResizablePanel>
  );
};

export default TicketsBottomDrawer;
