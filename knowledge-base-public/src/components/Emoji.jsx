export const Emoji = ({emoji, className = "mr-1"}) => {
    return <span className={className} aria-hidden>{emoji}</span>;
  }