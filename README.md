# CHAINVILLE

## Title

Chainville

![ChainVille Logo](https://res.cloudinary.com/dydj8hnhz/image/upload/v1725388562/lrmlhl0okjoxskawbnzp.png)

## Description

ChainVille is an on-chain city builder game that leverages blockchain technology to create a decentralized and immersive urban development experience. Players can acquire, develop, and manage virtual districts, engaging in various aspects of city planning and management.

## Key Features
- District acquisition and management
- Infrastructure development
- Resource management
- District merging for expansion
- Blockchain-based ownership and transactions

## Gameplay

### Objective
Get more points by building a virtual city.

### How to play

1. Connect your wallet on base sepolia with the game for transactions.
2. Purchase a district.
3. Build your city by constructing various structures and infrastructure.
4. Update city state as you develop and grow your district.
5. Optionally, sell a district for any amount you choose.

## Process Flow

```
+----------------+     +-----------------+     +----------------+
|                |     |                 |     |                |
|  Front-end     |---->|  Smart Contract |---->|  Event Indexer |
|  Interface     |     |  (Blockchain)   |     |  (Subsquid)    |
|                |     |                 |     |                |
+----------------+     +-----------------+     +----------------+
        ^                      |                       |
        |                      |                       |
        |                      v                       v
+----------------+     +-----------------+     +----------------+
|                |     |                 |     |                |
|  Client State  |<----|  State Changes  |<----|   Database     |
|  Update        |     |                 |     |                |
|                |     |                 |     |                |
+----------------+     +-----------------+     +----------------+
```

1. **User Interaction**: Players interact with the game through a front-end interface.
2. **Smart Contract Execution**: User actions trigger smart contract functions (e.g., acquireDistrict, updateDistrictState).
3. **Event Emission**: The smart contract emits events (e.g., DistrictAcquired, DistrictStateUpdated).
4. **Event Indexing**: An indexer like Subsquid captures and processes these events.
5. **Database Storage**: Processed events are stored in a database for efficient querying.
6. **Client State Update**: The front-end updates based on the latest blockchain state and indexed events.
7. **Neighbor Awareness**: Players can observe and interact with neighboring districts.

## Technical Stack

### Frontend
- TypeScript
- 3D Rendering
- React
- Vite

### Backend
- Solidity
- Hardhat
- Subsquid

Contract Address: `0x4f259F00EFa16dB2e20CC6C7D1f2B0719f63ecc5`

subsquid endpoint: https://92b4fce6-8879-4e64-9ae5-56c20f27f8ef.squids.live/transactions-example/v/v1/graphql

## Future Work

1. **Enhanced Infrastructure Placement**
   - Implement a more sophisticated system for structural updates and placement
   - Introduce zoning regulations and city planning mechanics

2. **Expanded District Types**
   - Parks/Recreation (🌳)
   - City Planning (🗺️)
   - Community Services (🤝)
   - Environmental Management (♻️)

3. **Advanced Gameplay Mechanics**
   - Player Collaboration (👥): Allow players to form alliances and work on joint projects
   - Trade Center (🔄): Implement a marketplace for resources and district trading

4. **Improved Resource Management**
   - Introduce more complex resource chains and interdependencies
   - Implement dynamic resource pricing based on supply and demand

5. **Enhanced Visualization**
   - Develop 3D models for districts and buildings
   - Implement real-time rendering of city changes

6. **Governance Mechanism**
   - Introduce voting systems for city-wide decisions


7. **Integration with DeFi**
   - Implement yield-generating structures within the game
   - Allow for staking and liquidity provision mechanics

8. **Cross-Chain Compatibility**
   - Explore integration with other blockchain networks for increased interoperability


By implementing these features, ChainVille aims to create a more engaging, complex, and realistic city-building experience that fully leverages the potential of blockchain technology.

## License

Licensed under a standard agreement allowing personal, non-commercial use. For other uses, contact us for licensing options.
