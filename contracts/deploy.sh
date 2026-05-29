#!/bin/bash

# Deployment script for Smasage Soroban Contracts
set -e

# Configuration
NETWORK="testnet"
SOURCE="deployer"
WASM_PATH="target/wasm32v1-none/release/smasage_contracts.wasm"
ENV_PATH="../agent/.env"

echo ">> Building contract..."
cargo build --target wasm32-unknown-unknown --release

echo ">> Deploying to $NETWORK using identity '$SOURCE'..."
CONTRACT_ID=$(soroban contract deploy \
  --wasm "$WASM_PATH" \
  --source "$SOURCE" \
  --network "$NETWORK")

echo ">> Contract deployed successfully!"
echo ">> Contract ID: $CONTRACT_ID"

# Update the .env file if it exists
if [ -f "$ENV_PATH" ]; then
    echo "Updating $ENV_PATH with new Contract ID..."
    # Use sed to replace the SMASAGE_CONTRACT_ID value
    if grep -q "SMASAGE_CONTRACT_ID=" "$ENV_PATH"; then
        sed -i "s/^SMASAGE_CONTRACT_ID=.*/SMASAGE_CONTRACT_ID=$CONTRACT_ID/" "$ENV_PATH"
    else
        echo "SMASAGE_CONTRACT_ID=$CONTRACT_ID" >> "$ENV_PATH"
    fi
    echo ">> agent/.env updated."
else
    echo ">>  Warning: $ENV_PATH not found. Please update it manually."
fi

echo ">> Deployment complete!"
