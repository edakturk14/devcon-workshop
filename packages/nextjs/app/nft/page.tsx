"use client";

import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { useWriteContracts } from "wagmi/experimental";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const Debug: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { data: tokenID } = useScaffoldReadContract({
    contractName: "NFT",
    functionName: "currentTokenId",
  });

  const { data: supply } = useScaffoldReadContract({
    contractName: "NFT",
    functionName: "maxSupply",
  });

  const { data: NFT } = useDeployedContractInfo("NFT");
  // wagmi hook to batch write to multiple contracts (EIP-5792 specific)
  const { writeContractsAsync, isPending: isBatchContractInteractionPending } = useWriteContracts();

  const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => {
    if (supply !== undefined) {
      setRemaining(Number(supply) - (tokenID ? Number(tokenID) : 0));
    }
  }, [tokenID, supply]);

  return (
    <>
      <div className="flex items-center flex-col mt-10">
        <h1 className="text-center">
          <span className="block text-4xl font-bold">Mint a Bird</span>
          <span className="block text-2xl font-bold mt-1">NFTs left: {remaining}</span>
        </h1>
        <div className="card bg-base-100 w-96 shadow-xl mt-5">
          <figure>
            <img
              src="https://cdn.britannica.com/33/226533-050-404C15AF/Canary-on-pear-branch.jpg"
              alt="A cute bird"
              className="w-full h-48 object-cover"
            />
          </figure>
          <div className="card-body items-center">
            <div className="card-actions justify-end">
              {connectedAddress ? (
                <button
                  className="btn btn-primary w-45"
                  onClick={async () => {
                    try {
                      if (!NFT) return;
                      const paymasterURL = "https://erc7677-proxy-production-92bf.up.railway.app";
                      const txnId = await writeContractsAsync({
                        contracts: [
                          {
                            address: NFT.address,
                            abi: NFT.abi,
                            functionName: "mintTo",
                            args: [connectedAddress],
                          },
                        ],
                        capabilities: {
                          paymasterService: {
                            url: paymasterURL,
                          },
                        },
                      });
                    } catch (e) {
                      console.error("Error minting NFT:", e);
                    }
                  }}
                >
                  Mint
                </button>
              ) : (
                <span className="text-gray-500">Connect Wallet</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Debug;
