import { Link } from "@tanstack/react-router";
import { Heart, ArrowUpRight } from "lucide-react";
import type { NFT } from "@/types";
import { formatEth } from "@/lib/money";
import { useFavorites, useToggleFavorite } from "@/lib/hooks";

export function NFTCard({ nft }: { nft: NFT }) {
  const { data: favorites = [] } = useFavorites();
  const toggle = useToggleFavorite();
  const favorite = favorites.includes(nft.id);
  return (
    <article className="nft-card">
      <div className="nft-art-wrap">
        <Link
          to="/nft/$nftId"
          params={{ nftId: nft.id }}
          className="nft-art-link"
          aria-label={`Ver ${nft.name}`}
        >
          <img
            className="nft-art"
            src={nft.image}
            alt={`Arte digital ${nft.name}`}
            loading="lazy"
          />
          <span className="art-view">
            <ArrowUpRight size={17} />
          </span>
        </Link>
        <button
          className={`favorite-button ${favorite ? "is-favorite" : ""}`}
          aria-label={
            favorite
              ? `Remover ${nft.name} dos favoritos`
              : `Adicionar ${nft.name} aos favoritos`
          }
          onClick={() => toggle.mutate(nft.id)}
        >
          <Heart size={18} fill={favorite ? "currentColor" : "none"} />
        </button>
        <span className="edition-pill">Edição {nft.edition}</span>
      </div>
      <div className="nft-card-info">
        <div className="nft-card-heading">
          <div>
            <p className="eyebrow">{nft.collection}</p>
            <Link
              to="/nft/$nftId"
              params={{ nftId: nft.id }}
              className="nft-name"
            >
              {nft.name}
            </Link>
          </div>
          <div className="price-block">
            <span>Preço</span>
            <strong>{formatEth(nft.price)}</strong>
          </div>
        </div>
        <div className="nft-card-bottom">
          <span className="artist-line">
            <span className="artist-avatar">{nft.artist.charAt(0)}</span>
            {nft.artist}
          </span>
          <span className={nft.available <= 3 ? "stock-low" : "stock-label"}>
            {nft.available} disponíveis
          </span>
        </div>
      </div>
    </article>
  );
}
