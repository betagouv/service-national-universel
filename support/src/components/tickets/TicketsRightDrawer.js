import ResizablePanel from "../ResizablePanel";

const TicketsRightDrawer = () => {
  return (
    <ResizablePanel className={`z-10 flex w-80 shrink-0 grow-0 overflow-hidden border-l-2`} position="right" name="admin-tickets-right-panel">
      <div className="relative flex w-full flex-col overflow-hidden pr-2"></div>
    </ResizablePanel>
  );
};

export default TicketsRightDrawer;
