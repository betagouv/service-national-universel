let channel: BroadcastChannel | null = null;

export const getImpersonationChannel = () => {
  if (!channel) {
    channel = new BroadcastChannel("impersonation");
  }
  return channel;
};

export const closeImpersonationChannel = () => {
  if (channel) {
    channel.close();
    channel = null;
  }
};
