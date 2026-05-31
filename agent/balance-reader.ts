import {
  SorobanRpc,
  Address,
  nativeToScVal,
  scValToNative,
  xdr,
  TransactionBuilder,
  BASE_FEE,
  Networks,
} from "@stellar/stellar-sdk";

/**
 * Smasage Balance Reader
 * Reads on-chain state from the Soroban contract using the current Stellar SDK API.
 * Uses simulateTransaction for read-only contract operations.
 */

const SOROBAN_RPC_URL =
  process.env.SOROBAN_RPC_URL || "https://soroban-test.stellar.org";
const SMASAGE_CONTRACT_ID = process.env.SMASAGE_CONTRACT_ID || "";
const NETWORK_PASSPHRASE =
  process.env.NETWORK_PASSPHRASE || Networks.TESTNET_NETWORK_PASSPHRASE;

const server = new SorobanRpc.Server(SOROBAN_RPC_URL);

/**
 * Helper function to invoke a read-only contract method using simulateTransaction.
 * This is the current recommended approach for reading contract state.
 */
async function invokeReadOnlyMethod(
  contractId: string,
  method: string,
  args: xdr.ScVal[],
): Promise<unknown> {
  try {
    // Create a dummy account for simulation (sequence number doesn't matter for read-only)
    const dummyAccount = {
      accountId:
        "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5V3VQ",
      sequenceNumber: "0",
    };

    // Build a transaction with the contract invocation
    const tx = new TransactionBuilder(dummyAccount, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        SorobanRpc.Operation.invokeContractFunction({
          contract: contractId,
          method: method,
          parameters: args,
        }),
      )
      .setTimeout(30)
      .build();

    // Simulate the transaction to get the result
    const simulated = await server.simulateTransaction(tx);

    if (SorobanRpc.Api.isSimulationSuccess(simulated)) {
      const result = simulated.result?.retval;
      if (result) {
        return scValToNative(result);
      }
    } else if (SorobanRpc.Api.isSimulationError(simulated)) {
      console.error("Simulation error:", simulated.error);
      throw new Error(`Contract simulation failed: ${simulated.error}`);
    }

    return null;
  } catch (error) {
    console.error("Error invoking read-only method:", error);
    throw error;
  }
}

/**
 * Read user's USDC balance from the Smasage contract
 */
export async function getUserBalance(userAddress: string): Promise<number> {
  try {
    const userAddr = new Address(userAddress);
    const result = await invokeReadOnlyMethod(
      SMASAGE_CONTRACT_ID,
      "get_balance",
      [userAddr.toScVal()],
    );

    const response = await server.invokeContract({
      contractId: contractAddress.toString(),
      method: 'get_balance',
      args: [userAddr.toScVal()],
    });

    if (response === undefined || response === null) {
      throw new Error('Soroban contract invocation returned null/undefined');
    }
    
    return Number(response.valueOf());
    return typeof result === "number" ? result : 0;
  } catch (error) {
    console.error("Error fetching USDC balance:", error);
    return 0;
  }
}

/**
 * Read user's Gold (XAUT) balance from the Smasage contract
 */
export async function getUserGoldBalance(userAddress: string): Promise<number> {
  try {
    const userAddr = new Address(userAddress);
    const result = await invokeReadOnlyMethod(
      SMASAGE_CONTRACT_ID,
      "get_gold_balance",
      [userAddr.toScVal()],
    );

    const response = await server.invokeContract({
      contractId: contractAddress.toString(),
      method: 'get_gold_balance',
      args: [userAddr.toScVal()],
    });

    if (response === undefined || response === null) {
      throw new Error('Soroban contract invocation returned null/undefined');
    }
    
    return Number(response.valueOf());
    return typeof result === "number" ? result : 0;
  } catch (error) {
    console.error("Error fetching Gold balance:", error);
    return 0;
  }
}

/**
 * Read user's LP shares balance from the Smasage contract
 */
export async function getUserLPShares(userAddress: string): Promise<number> {
  try {
    const userAddr = new Address(userAddress);
    const result = await invokeReadOnlyMethod(
      SMASAGE_CONTRACT_ID,
      "get_lp_shares",
      [userAddr.toScVal()],
    );

    const response = await server.invokeContract({
      contractId: contractAddress.toString(),
      method: 'get_lp_shares',
      args: [userAddr.toScVal()],
    });

    if (response === undefined || response === null) {
      throw new Error('Soroban contract invocation returned null/undefined');
    }
    
    return Number(response.valueOf());
    return typeof result === "number" ? result : 0;
  } catch (error) {
    console.error("Error fetching LP shares:", error);
    return 0;
  }
}

/**
 * Get complete portfolio snapshot for a user
 */
export async function getPortfolioSnapshot(userAddress: string) {
  const [usdcBalance, goldBalance, lpShares] = await Promise.all([
    getUserBalance(userAddress),
    getUserGoldBalance(userAddress),
    getUserLPShares(userAddress),
  ]);

  return {
    usdcBalance,
    goldBalance,
    lpShares,
    totalValue: usdcBalance + goldBalance + lpShares,
    timestamp: new Date().toISOString(),
  };
}

// Example usage
async function main() {
  if (!SMASAGE_CONTRACT_ID) {
    console.log(
      "⚠️  SMASAGE_CONTRACT_ID not set. Using mock data for demonstration.",
    );

    // Mock data for testing
    const mockUser = "GCI3KDRBQZLJ3WDNT7Y6VZLKZB4U5NP2HMQXK7PQWZ3LMRST5UVWX4YZ";
    console.log("\n📊 Mock Portfolio Snapshot:");
    console.log({
      usdcBalance: 1540.23,
      goldBalance: 256.78,
      lpShares: 769.45,
      totalValue: 2566.46,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  const userAddress = process.env.USER_ADDRESS;
  if (!userAddress) {
    console.error("❌ USER_ADDRESS environment variable required");
    return;
  }

  console.log(`\n🔍 Fetching portfolio for ${userAddress}...`);
  const snapshot = await getPortfolioSnapshot(userAddress);

  console.log("\n📊 Portfolio Snapshot:");
  console.log(`   USDC Balance: $${snapshot.usdcBalance.toFixed(2)}`);
  console.log(`   Gold (XAUT): $${snapshot.goldBalance.toFixed(2)}`);
  console.log(`   LP Shares: $${snapshot.lpShares.toFixed(2)}`);
  console.log(`   Total Value: $${snapshot.totalValue.toFixed(2)}`);
  console.log(`   Updated: ${snapshot.timestamp}`);
}

main();
