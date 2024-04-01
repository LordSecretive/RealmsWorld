"use client";

import type { Quote } from "@avnu/avnu-sdk";
import type { ChangeEvent } from "react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { NETWORK_NAME, SUPPORTED_L2_CHAIN_ID } from "@/constants/env";
import useDebounce from "@/hooks/useDebounce";
import LordsIcon from "@/icons/lords.svg";
import { executeSwap, fetchQuotes } from "@avnu/avnu-sdk";
import { useAccount } from "@starknet-react/core";
import { parseUnits } from "ethers";
import { ArrowUpDown } from "lucide-react";
import { formatEther, formatUnits } from "viem";

import { ChainId, LORDS } from "@realms-world/constants";
import { SUPPORTED_TOKENS } from "@realms-world/constants/src/Tokens";
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@realms-world/ui";

import { StarknetLoginButton } from "../_components/wallet/StarknetLoginButton";
import { TokenBalance } from "../bridge/TokenBalance";
import { useWalletsProviderContext } from "../providers/WalletsProvider";

const AVNU_OPTIONS = {
  baseUrl: `https://${NETWORK_NAME == "MAIN" ? "starknet" : "goerli"}.api.avnu.fi`,
};

export const SwapTokens = () => {
  const [isBuyLords, setIsBuyLords] = useState(true);
  const [sellAmount, setSellAmount] = useState<string>();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();
  const { account } = useAccount();
  const { balances, l2loading } = useWalletsProviderContext();
  const [selectedToken, setSelectedToken] = useState("ETH");

  const getTokenBySymbol = (symbol: string) => {
    const token = SUPPORTED_TOKENS[ChainId.SN_MAIN].find(
      (token) => token.symbol === symbol,
    );
    return token;
  };
  const selectedTokenObj = useMemo(() => {
    return getTokenBySymbol(selectedToken);
  }, [selectedToken]);

  const isDebouncing = useDebounce(sellAmount, 350) !== sellAmount;

  const fetchAvnuQuotes = useCallback(() => {
    if (!account) return;
    if (!selectedTokenObj || !sellAmount || isDebouncing) return;

    const params = {
      sellTokenAddress: isBuyLords
        ? selectedTokenObj.address
        : LORDS[SUPPORTED_L2_CHAIN_ID]?.address ?? "0x",
      buyTokenAddress: isBuyLords
        ? LORDS[SUPPORTED_L2_CHAIN_ID]?.address ?? "0x"
        : selectedTokenObj.address,
      sellAmount: parseUnits(sellAmount, selectedTokenObj.decimals),
      takerAddress: account.address,
      size: 1,
    };
    fetchQuotes(params, AVNU_OPTIONS)
      .then((quotes) => {
        setLoading(false);
        setQuotes(quotes);
      })
      .catch(() => setLoading(false));
  }, [account, isBuyLords, isDebouncing, selectedTokenObj, sellAmount]);
  const sellBalance = !isBuyLords ? balances.l2.lords ?? 0 : balances.l2?.eth ?? 0

  const handleChangeInput = (event: ChangeEvent<HTMLInputElement>) => {
    setErrorMessage("");
    setQuotes([]);
    setSellAmount(event.target.value);
    setLoading(true);
  };
  const handleSwitch = () => {
    setQuotes([]);
    setIsBuyLords((prevIsBuyLords) => !prevIsBuyLords);
  };

 useEffect(() => {
    if (sellAmount && selectedTokenObj && !isDebouncing) {
      fetchAvnuQuotes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBuyLords, selectedTokenObj, isDebouncing, sellAmount]);

  const handleSwap = async () => {
    if (!account || !sellAmount || !quotes?.[0]) return;
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);
    executeSwap(account, quotes[0], {}, AVNU_OPTIONS)
      .then(() => {
        setSuccessMessage("success");
        setLoading(false);
        setQuotes([]);
      })
      .catch((error: Error) => {
        setLoading(false);
        setErrorMessage(error.message);
      });
  };

  /*if (!account) {
    return <button onClick={handleConnect}>Connect Wallet</button>
  }*/

  const renderTokensInput = () => {
    return (
      <div className="flex pb-2">
        {isBuyLords ? (
          <Input
            className="flex-grow-1 mb-0 !bg-transparent text-xl focus:ring-0"
            onChange={handleChangeInput}
            value={sellAmount}
            //disabled={loading}
            placeholder="0"
          />
        ) : (
          <Input
            readOnly
            placeholder="0"
            type="text"
            className="!bg-transparent text-xl focus:ring-0 placeholder:text-slate-400 "
            disabled={loading}
            id="buy-amount"
            value={
              quotes?.[0]
                ? formatUnits(
                    quotes[0].buyAmount,
                    selectedTokenObj?.decimals ?? 18,
                  )
                : ""
            }
          />
        )}
        <div className="grow-0">
          <Select value={selectedToken} onValueChange={setSelectedToken}>
            <SelectTrigger>
              <SelectValue placeholder="Select Token" />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_TOKENS[ChainId.SN_MAIN]
                .filter((token) => token.symbol !== "LORDS")
                .map((token, index) => (
                  <SelectItem key={index} value={token.symbol ?? ""}>
                    <span className="flex pr-6 text-lg">
                      <Image
                        className="mr-2"
                        src={`/tokens/${token.symbol}.svg`}
                        width={20}
                        height={20}
                        alt={token.name ?? ""}
                      />
                      {token?.symbol}
                    </span>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  const renderLordsInput = () => {
    return (
      <div className="relative w-full">
        {isBuyLords ? (
          <Input
            readOnly
            placeholder="0"
            type="text"
            className="!bg-transparent text-xl focus:ring-0 placeholder:text-slate-400 "
            disabled={loading}
            id="buy-amount"
            value={quotes?.[0] ? formatEther(quotes[0].buyAmount) : ""}
          />
        ) : (
          <Input
            className="flex-grow-1 mb-0 !bg-transparent text-xl focus:ring-0"
            onChange={handleChangeInput}
            value={sellAmount}
            //disabled={loading}
            placeholder="0"
          />
        )}
        <div className="absolute right-0 top-0 flex pr-4 pt-2">
          <LordsIcon className="mr-3 h-6 w-6 fill-white" />
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto mt-24 max-w-[460px]">
      <div className="rounded border bg-black/20  p-4 focus-within:!border-bright-yellow/80 hover:border-bright-yellow/40">
        <p className="text-sm">You pay</p>
        {isBuyLords ? renderTokensInput() : renderLordsInput()}
        <TokenBalance
          onClick={() => setSellAmount(formatEther(BigInt(sellBalance) ?? 0n))}
          balance={sellBalance}
          symbol="ETH"
          isLoading={l2loading && !balances.l2?.lords}
        />
      </div>
      <button
        className="absolute left-1/2 z-10 -ml-4 flex h-8 w-8 rounded-2xl border border-white/5 bg-bright-yellow/60 stroke-black hover:bg-white/90"
        onClick={() => handleSwitch()}
        tabIndex={0}
      >
        <ArrowUpDown
          className={`${
            isBuyLords ? "rotate-180" : ""
          } m-auto h-4 w-4 transform self-center stroke-inherit duration-300`}
        />
      </button>

      <div className="mt-8 rounded border  bg-black/20  p-4 focus-within:!border-bright-yellow/80 hover:border-bright-yellow/40">
        <p className="text-sm">You receive</p>
        {isBuyLords ? renderLordsInput() : renderTokensInput()}
      </div>
      {!account ? (
        <StarknetLoginButton  buttonClass="w-full mt-2"/>
      ) : (
        <Button onClick={handleSwap} className="mt-2 w-full">
          {sellAmount == "0" || !sellAmount ? (
            "Enter amount"
          ) : loading ? (
            <p>Loading...</p>
          ) : (
            quotes?.[0] && "Swap"
          )}
        </Button>
      )}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      {successMessage && <p style={{ color: "green" }}>Success</p>}
    </div>
  );
};
