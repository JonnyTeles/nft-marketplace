export type NFT = {
  id: string;
  name: string;
  artist: string;
  collection: string;
  image: string;
  price: string;
  available: number;
  edition: number;
  description: string;
  category: string;
  version: number;
};
export type User = { id: string; name: string; email: string; avatar: string };
export type CartItem = { nftId: string; quantity: number };
export type Wallet = {
  id: string;
  name: string;
  address: string;
  network: string;
  primary: boolean;
};
export type OrderStatus = "pending" | "confirmed" | "rejected";
export type Order = {
  id: string;
  transactionId: string;
  status: OrderStatus;
  items: Array<{ nft: NFT; quantity: number; unitPrice: string }>;
  subtotal: string;
  fee: string;
  total: string;
  createdAt: string;
  version: number;
};
export type ApiError = {
  code: string;
  message: string;
  fields?: Record<string, string>;
};
