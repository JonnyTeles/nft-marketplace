import type { NFT, User, Wallet, Order } from "@/types";

export const initialNFTs: NFT[] = [
  {
    id: "nft-aurora",
    name: "Aurora Fragment #08",
    artist: "Lia Monteiro",
    collection: "Chromatic Dreams",
    image: "/artworks/aurora.svg",
    price: "0.82",
    available: 7,
    edition: 12,
    description:
      "Uma composição abstrata sobre luz, memória e movimento. Cada fragmento apresenta uma combinação cromática única.",
    category: "Arte",
    version: 1,
  },
  {
    id: "nft-orbit",
    name: "Orbiting Silence",
    artist: "Caio Nunes",
    collection: "Beyond Matter",
    image: "/artworks/orbit.svg",
    price: "1.25",
    available: 3,
    edition: 10,
    description:
      "Formas digitais orbitam em um espaço onde gravidade e silêncio se encontram.",
    category: "3D",
    version: 1,
  },
  {
    id: "nft-bloom",
    name: "Digital Bloom",
    artist: "Maya Costa",
    collection: "Synthetic Garden",
    image: "/artworks/bloom.svg",
    price: "0.46",
    available: 18,
    edition: 25,
    description:
      "Um jardim generativo que celebra a imperfeição da natureza reinterpretada por algoritmos.",
    category: "Arte",
    version: 1,
  },
  {
    id: "nft-echo",
    name: "Echoes of Tomorrow",
    artist: "Studio Norte",
    collection: "Future Relics",
    image: "/artworks/echo.svg",
    price: "2.10",
    available: 2,
    edition: 5,
    description: "Relíquias imaginadas de um futuro que ainda não aconteceu.",
    category: "Colecionáveis",
    version: 1,
  },
  {
    id: "nft-tide",
    name: "Tidal Memory",
    artist: "Lia Monteiro",
    collection: "Chromatic Dreams",
    image: "/artworks/tide.svg",
    price: "0.73",
    available: 11,
    edition: 20,
    description:
      "Camadas de cor inspiradas no ritmo das marés e na memória do oceano.",
    category: "Arte",
    version: 1,
  },
  {
    id: "nft-void",
    name: "The Soft Void",
    artist: "Noah Alves",
    collection: "Beyond Matter",
    image: "/artworks/void.svg",
    price: "1.08",
    available: 6,
    edition: 8,
    description:
      "Uma exploração minimalista do vazio como espaço de possibilidades.",
    category: "3D",
    version: 1,
  },
  {
    id: "nft-prism",
    name: "Prism Studies 04",
    artist: "Maya Costa",
    collection: "Synthetic Garden",
    image: "/artworks/prism.svg",
    price: "0.38",
    available: 22,
    edition: 30,
    description: "Estudo de refração, transparência e geometria generativa.",
    category: "Arte",
    version: 1,
  },
  {
    id: "nft-moon",
    name: "Moon Archive",
    artist: "Studio Norte",
    collection: "Future Relics",
    image: "/artworks/moon.svg",
    price: "1.64",
    available: 4,
    edition: 6,
    description: "Um arquivo visual fictício de observações lunares.",
    category: "Colecionáveis",
    version: 1,
  },
];
export const initialUsers: Array<User & { passwordHash: string }> = [
  {
    id: "user-1",
    name: "Jonny Gabriel Teles",
    email: "jonny@demo.com",
    passwordHash:
      "588c55f3ce2b8569b153c5abbf13f9f74308b88a20017cc699b835cc93195d16",
    avatar: "/avatars/alex.svg",
  },
  {
    id: "user-2",
    name: "John Doe",
    email: "john@demo.com",
    passwordHash:
      "588c55f3ce2b8569b153c5abbf13f9f74308b88a20017cc699b835cc93195d16",
    avatar: "/avatars/sam.svg",
  },
];
export const initialWallets: Wallet[] = [
  {
    id: "wallet-1",
    name: "Carteira principal",
    address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    network: "Ethereum",
    primary: true,
  },
  {
    id: "wallet-2",
    name: "Carteira secundária",
    address: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
    network: "Polygon",
    primary: false,
  },
];
export const readStore = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(`forma.${key}`);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};
export const writeStore = (key: string, value: unknown) =>
  localStorage.setItem(`forma.${key}`, JSON.stringify(value));
export const getNFTs = () => readStore<NFT[]>("nfts", initialNFTs);
export const saveNFTs = (items: NFT[]) => writeStore("nfts", items);
export const getOrders = () => readStore<Order[]>("orders", []);
