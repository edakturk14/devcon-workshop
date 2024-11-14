"use client";

import { useEffect, useState } from "react";
import { MyHoldings } from "./_components/MyHoldings";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { useWriteContracts } from "wagmi/experimental";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const Debug: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  const { data: supply } = useScaffoldReadContract({
    contractName: "NFT",
    functionName: "maxSupply",
  });

  const { data: tokenID } = useScaffoldReadContract({
    contractName: "NFT",
    functionName: "_nextTokenId",
  });

  const { writeContractAsync: writeScaffoldContractAsync } = useScaffoldWriteContract("NFT");

  const { data: NFT } = useDeployedContractInfo("NFT");
  // wagmi hook to batch write to multiple contracts (EIP-5792 specific)
  const { writeContractsAsync } = useWriteContracts();

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
          <div className="card-body items-center">
            <div className="card-actions justify-end">
              {connectedAddress ? (
                <div className="flex space-x-2">
                  <button
                    className="btn btn-primary w-45"
                    onClick={async () => {
                      try {
                        if (!NFT) return;
                        const paymasterURL = "https://erc7677-proxy-production-92bf.up.railway.app";
                        await writeContractsAsync({
                          contracts: [
                            {
                              address: NFT.address,
                              abi: NFT.abi,
                              functionName: "safeMint",
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
                    Gasless Mint
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={async () => {
                      try {
                        await writeScaffoldContractAsync({
                          functionName: "safeMint",
                          args: [connectedAddress],
                        });
                      } catch (e) {
                        console.error("Error minting NFT:", e);
                      }
                    }}
                  >
                    Mint NFT
                  </button>
                </div>
              ) : (
                <span className="text-gray-500">Connect Wallet</span>
              )}
            </div>
          </div>
        </div>
        <MyHoldings />
      </div>
    </>
  );
};

export default Debug;
