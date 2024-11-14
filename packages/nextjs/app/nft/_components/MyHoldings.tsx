"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export interface Collectible {
  id: number;
  uri: string;
  owner: string;
  tokenURI: string;
}

export const MyHoldings = () => {
  const { address: connectedAddress } = useAccount(); // Get connected wallet address
  const [myAllCollectibles, setMyAllCollectibles] = useState<Collectible[]>([]);
  const [allCollectiblesLoading, setAllCollectiblesLoading] = useState(false);

  // Get NFT contract instance
  const { data: yourNFTContract } = useScaffoldContract({
    contractName: "NFT",
  });

  // Read total NFTs owned by connected address
  const { data: myTotalBalance } = useScaffoldReadContract({
    contractName: "NFT",
    functionName: "balanceOf",
    args: [connectedAddress],
    watch: true, // Auto-refresh on chain updates
  });

  useEffect(() => {
    // Fetch all NFTs owned by user
    const updateMyCollectibles = async (): Promise<void> => {
      if (myTotalBalance === undefined || yourNFTContract === undefined || connectedAddress === undefined) return;
      setAllCollectiblesLoading(true);

      const collectibleUpdate: Collectible[] = [];
      const totalBalance = parseInt(myTotalBalance.toString());

      // Loop through each owned NFT index to get token details
      for (let tokenIndex = 0; tokenIndex < totalBalance; tokenIndex++) {
        try {
          // Get tokenId and URI for each index
          const tokenId = await yourNFTContract.read.tokenOfOwnerByIndex([connectedAddress, BigInt(tokenIndex)]);
          const tokenURI = await yourNFTContract.read.tokenURI([tokenId]);
          collectibleUpdate.push({
            id: parseInt(tokenId.toString()),
            uri: tokenURI,
            owner: connectedAddress,
            tokenURI: tokenURI,
          });
        } catch (e) {
          notification.error("Error fetching all collectibles");
          setAllCollectiblesLoading(false);
          console.log(e);
        }
      }

      collectibleUpdate.sort((a, b) => a.id - b.id);
      setMyAllCollectibles(collectibleUpdate);
      setAllCollectiblesLoading(false);
    };

    updateMyCollectibles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedAddress, myTotalBalance]); // Re-run when address or balance changes

  // Loading spinner while fetching
  if (allCollectiblesLoading)
    return (
      <div className="flex justify-center items-center mt-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );

  // Display NFTs or "No NFTs found" message
  return (
    <>
      {myAllCollectibles.length === 0 ? (
        <div className="flex justify-center items-center mt-10">
          <div className="text-2xl text-primary-content">No NFTs found</div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
          {myAllCollectibles.map(item => (
            <div key={item.id} className="card bg-base-100 shadow-xl min-w-64">
              <figure className="px-4 pt-4 ">
                {/* eslint-disable-next-line  */}
                <img
                  src={item.tokenURI.replace(/\d+$/, "")} // Remove any trailing numbers
                  alt={`NFT #${item.id}`}
                  className="rounded-xl object-cover h-48 w-full"
                />
              </figure>
              <div className="card-body p-4 space-y-1">
                <h3 className="card-title">NFT #{item.id}</h3>
                <div className="text-sm space-y-2">
                  <p className="p-0 m-0">Owner</p>
                  <Address address={item.owner} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};
