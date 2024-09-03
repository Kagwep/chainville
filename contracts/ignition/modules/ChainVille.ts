import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const INITIAL_OWNER = '0x768096b6D00ed0Bd11860A5B5E395E6A5ac29f0B';
const DISTRICT_PRICE: bigint = 200_000_000_000_000n;

const ChainVilleModule = buildModule("ChainVilleModule", (m) => {
  const initialOwner = m.getParameter("initialOwner", INITIAL_OWNER);
  const _districtPrice = m.getParameter("_districtPrice", DISTRICT_PRICE);

  const chainville = m.contract("ChainVille", [initialOwner], {
    value: _districtPrice,
  });

  return { chainville };
});

export default ChainVilleModule;
