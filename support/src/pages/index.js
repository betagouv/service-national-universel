import Link from "next/link";
import WIP from "../components/WIP";

const Home = () => {
  return (
    <WIP title="Bienvenue sur le support du SNU !">
      <Link href="/admin">
        <button>Espace admin</button>
      </Link>
    </WIP>
  );
};

export default Home;
